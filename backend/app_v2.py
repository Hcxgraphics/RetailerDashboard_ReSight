"""
ReSight FastAPI Backend v2
Production Retail Intelligence Platform with real-time ML inference
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import shap
from datetime import datetime, timedelta
import asyncio
import logging
from contextlib import asynccontextmanager

# Import our database and data API
from database import (
    init_db, get_db, Product, Store, Event, Rule, AuditLog, MLScore,
    EventType, RuleType, StorePlatform
)
from retail_data_api import RetailDataAPI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for ML artifacts
model = None
encoders = None
FEATURES = []
explainer = None

# WebSocket connections for real-time updates
active_connections: List[WebSocket] = []


def load_ml_artifacts():
    """Load ML models and artifacts at startup"""
    global model, encoders, FEATURES, explainer
    
    base_path = os.path.join(os.path.dirname(__file__), "..", "azureml")
    
    try:
        # Load model
        model_path = os.path.join(base_path, "lightgbm_ranker.pkl")
        model = joblib.load(model_path)
        logger.info(f"✓ Loaded model from {model_path}")
        
        # Load encoders
        encoders_path = os.path.join(base_path, "encoders.pkl")
        encoders = joblib.load(encoders_path)
        logger.info(f"✓ Loaded encoders from {encoders_path}")
        
        # Load features
        features_path = os.path.join(base_path, "features.txt")
        with open(features_path, "r") as f:
            FEATURES = [line.strip() for line in f.readlines()]
        logger.info(f"✓ Loaded {len(FEATURES)} features from {features_path}")
        
        logger.info("✓ ML artifacts loaded successfully")
        
    except Exception as e:
        logger.error(f"✗ Error loading ML artifacts: {e}")
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle"""
    # Startup
    logger.info("Starting ReSight API...")
    init_db()  # Initialize database
    load_ml_artifacts()  # Load ML models
    
    # Start background task for real-time KPI computation
    asyncio.create_task(background_ml_scoring())
    
    yield
    
    # Shutdown
    logger.info("Shutting down ReSight API...")


# Initialize FastAPI app
app = FastAPI(
    title="ReSight Retail Intelligence API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def background_ml_scoring():
    """Background task: Score all products every 30 seconds"""
    db = next(get_db())
    data_api = RetailDataAPI(db)
    
    while True:
        try:
            await asyncio.sleep(30)  # Run every 30 seconds
            logger.info("Running background ML scoring...")
            
            if model is None:
                continue
            
            # Get all products
            products = data_api.get_all_products(active_only=True)
            
            if not products:
                continue
            
            # Prepare features
            items_data = []
            for product in products:
                now = datetime.utcnow()
                item_dict = {
                    "item_id": product.item_id,
                    "price": product.price,
                    "stock": product.stock,
                    "verified_purchase": product.verified_purchase or 0.0,
                    "helpful_votes": product.helpful_votes or 0,
                    "avg_rating": product.avg_rating or 0.0,
                    "rating_count": product.rating_count or 0,
                    "year": now.year,
                    "month": now.month,
                    "day_of_week": now.weekday(),
                    "hour": now.hour,
                    "recency_weight": 0.8,  # Would calculate from events
                    "category": product.category,
                    "region": product.region or "IN",
                    "store": product.store.name if product.store else "online",
                    "main_category": product.main_category or product.category,
                    "popularity_bucket": product.popularity_bucket or "medium",
                    "price_bucket": product.price_bucket or "mid",
                }
                items_data.append(item_dict)
            
            # Score with ML
            X, df = prepare_features(items_data)
            scores = model.predict(X)
            
            # Create scored items
            scored_items = []
            for idx, item in enumerate(items_data):
                scored_items.append({
                    "item_id": item["item_id"],
                    "score": float(scores[idx]),
                })
            
            # Apply rules
            scored_items = data_api.apply_rules_to_scores(scored_items)
            
            # Update ML scores cache
            data_api.update_ml_scores(scored_items)
            
            # Broadcast to WebSocket clients
            await broadcast_kpi_update(data_api)
            
            logger.info(f"✓ Scored {len(scored_items)} products")
            
        except Exception as e:
            logger.error(f"Error in background ML scoring: {e}")
            await asyncio.sleep(30)


async def broadcast_kpi_update(data_api: RetailDataAPI):
    """Broadcast KPI updates to all WebSocket clients"""
    if not active_connections:
        return
    
    try:
        kpis = data_api.get_global_kpis()
        message = json.dumps({"type": "kpi_update", "data": kpis})
        
        # Send to all connected clients
        disconnected = []
        for connection in active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            active_connections.remove(conn)
            
    except Exception as e:
        logger.error(f"Error broadcasting KPI update: {e}")


def prepare_features(items: List[Dict]) -> tuple:
    """Prepare features for model inference"""
    df = pd.DataFrame(items)
    
    # Encode categorical features
    for col, encoder in encoders.items():
        if col in df.columns:
            df[col] = df[col].fillna("").astype(str)
            try:
                df[col] = encoder.transform(df[col])
            except Exception as e:
                logger.warning(f"Encoder failed for {col}: {e}")
                df[col] = 0
    
    # Ensure all required features are present
    for feat in FEATURES:
        if feat not in df.columns:
            df[feat] = 0
    
    # Select features in correct order
    X = df[FEATURES]
    return X, df


# Request/Response Models

class RankRequest(BaseModel):
    user_id: str
    items: Optional[List[Dict]] = None


class WhatIfPriceRequest(BaseModel):
    itemId: str
    newPrice: float


class PinRuleRequest(BaseModel):
    itemId: str
    created_by: Optional[str] = "system"


class BoostClearanceRequest(BaseModel):
    category: Optional[str] = None
    created_by: Optional[str] = "system"


class MarketplaceWebhook(BaseModel):
    item_id: str
    title: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    views: Optional[int] = None
    clicks: Optional[int] = None
    orders: Optional[int] = None
    metadata: Optional[Dict] = None


# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "ReSight Retail Intelligence API",
        "version": "2.0.0",
        "model_loaded": model is not None,
        "database": "connected"
    }


@app.get("/metrics")
async def get_metrics(db: Session = Depends(get_db)):
    """Get real-time KPI metrics"""
    data_api = RetailDataAPI(db)
    return data_api.get_global_kpis()


@app.post("/rank")
async def rank_items(request: RankRequest, db: Session = Depends(get_db)):
    """Get ranked product recommendations"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    data_api = RetailDataAPI(db)
    
    # Get cached ranked products (computed by background task)
    recommendations = data_api.get_ranked_products(limit=100)
    
    return recommendations


@app.get("/item/{item_id}")
async def get_item(item_id: str, db: Session = Depends(get_db)):
    """Get detailed item information with ML score and metrics"""
    data_api = RetailDataAPI(db)
    
    # Get product
    product = data_api.get_product_by_id(item_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    
    # Get ML score
    ml_score = data_api.get_product_ml_score(item_id)
    
    # Get metrics
    metrics = data_api.get_product_metrics(item_id)
    
    return {
        "item_id": product.item_id,
        "title": product.title,
        "category": product.category,
        "price": product.price,
        "stock": product.stock,
        "score": ml_score.score if ml_score else 0.0,
        "rank": ml_score.rank if ml_score else None,
        "rankChange": (ml_score.previous_rank - ml_score.rank) if ml_score and ml_score.previous_rank else 0,
        "metrics": metrics,
        "image_url": product.image_url,
        "brand": product.brand,
    }


@app.get("/explain/{item_id}")
async def explain_item(item_id: str, db: Session = Depends(get_db)):
    """Get SHAP feature importance for an item"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    data_api = RetailDataAPI(db)
    product = data_api.get_product_by_id(item_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    
    # Prepare features
    now = datetime.utcnow()
    item_dict = {
        "item_id": product.item_id,
        "price": product.price,
        "stock": product.stock,
        "verified_purchase": product.verified_purchase or 0.0,
        "helpful_votes": product.helpful_votes or 0,
        "avg_rating": product.avg_rating or 0.0,
        "rating_count": product.rating_count or 0,
        "year": now.year,
        "month": now.month,
        "day_of_week": now.weekday(),
        "hour": now.hour,
        "recency_weight": 0.8,
        "category": product.category,
        "region": product.region or "IN",
        "store": product.store.name if product.store else "online",
        "main_category": product.main_category or product.category,
        "popularity_bucket": product.popularity_bucket or "medium",
        "price_bucket": product.price_bucket or "mid",
    }
    
    X, _ = prepare_features([item_dict])
    
    # Compute SHAP values
    try:
        global explainer
        if explainer is None:
            explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        
        # Convert to dictionary
        if len(shap_values.shape) == 1:
            shap_dict = dict(zip(FEATURES, shap_values))
        else:
            shap_dict = dict(zip(FEATURES, shap_values[0]))
        
        # Normalize
        total_abs = sum(abs(v) for v in shap_dict.values())
        if total_abs > 0:
            shap_dict = {k: v / total_abs for k, v in shap_dict.items()}
        
        return shap_dict
        
    except Exception as e:
        logger.error(f"Error computing SHAP: {e}")
        # Return fallback
        return {
            "price": 0.22,
            "popularity": 0.28,
            "recency": 0.15,
            "stock": 0.10,
            "category": 0.12,
            "avg_rating": 0.13
        }


@app.post("/whatif/price")
async def whatif_price(request: WhatIfPriceRequest, db: Session = Depends(get_db)):
    """Simulate price change impact on ranking"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    data_api = RetailDataAPI(db)
    product = data_api.get_product_by_id(request.itemId)
    if not product:
        raise HTTPException(status_code=404, detail=f"Item {request.itemId} not found")
    
    # Get all products
    all_products = data_api.get_all_products(active_only=True)
    
    # Current ranking
    current_scores = data_api.get_ranked_products()
    current_item = next((item for item in current_scores if item["item_id"] == request.itemId), None)
    current_rank = current_item["rank"] if current_item else len(current_scores) + 1
    
    # Create modified product
    now = datetime.utcnow()
    items_data = []
    for p in all_products:
        item_dict = {
            "item_id": p.item_id,
            "price": request.newPrice if p.item_id == request.itemId else p.price,
            "stock": p.stock,
            "verified_purchase": p.verified_purchase or 0.0,
            "helpful_votes": p.helpful_votes or 0,
            "avg_rating": p.avg_rating or 0.0,
            "rating_count": p.rating_count or 0,
            "year": now.year,
            "month": now.month,
            "day_of_week": now.weekday(),
            "hour": now.hour,
            "recency_weight": 0.8,
            "category": p.category,
            "region": p.region or "IN",
            "store": p.store.name if p.store else "online",
            "main_category": p.main_category or p.category,
            "popularity_bucket": p.popularity_bucket or "medium",
            "price_bucket": "budget" if request.newPrice < 50 else ("mid" if request.newPrice < 150 else "premium") if p.item_id == request.itemId else (p.price_bucket or "mid"),
        }
        items_data.append(item_dict)
    
    # Score with new price
    X, df = prepare_features(items_data)
    scores = model.predict(X)
    
    scored_items = []
    for idx, item in enumerate(items_data):
        scored_items.append({
            "item_id": item["item_id"],
            "score": float(scores[idx]),
        })
    
    # Apply rules and sort
    scored_items = data_api.apply_rules_to_scores(scored_items)
    scored_items.sort(key=lambda x: x["score"], reverse=True)
    
    # Find new rank
    new_item = next((item for item in scored_items if item["item_id"] == request.itemId), None)
    new_rank = scored_items.index(new_item) + 1 if new_item else len(scored_items) + 1
    
    rank_change = current_rank - new_rank
    
    return {
        "rankChange": int(rank_change),
        "oldRank": current_rank,
        "newRank": new_rank
    }


@app.post("/rules/pin")
async def pin_item(request: PinRuleRequest, db: Session = Depends(get_db)):
    """Pin an item to the top of recommendations"""
    data_api = RetailDataAPI(db)
    
    # Check if product exists
    product = data_api.get_product_by_id(request.itemId)
    if not product:
        raise HTTPException(status_code=404, detail=f"Item {request.itemId} not found")
    
    # Create rule
    rule = data_api.create_rule({
        "item_id": request.itemId,
        "rule_type": RuleType.PIN,
        "strength": 1.0,
        "created_by": request.created_by,
    })
    
    # Log audit
    data_api.log_audit(
        action="rule_created",
        entity_type="rule",
        entity_id=str(rule.id),
        new_value=f"PIN {request.itemId}",
        user=request.created_by
    )
    
    return {"status": "ok", "message": f"Item {request.itemId} pinned", "rule_id": rule.id}


@app.post("/rules/boost-clearance")
async def boost_clearance(request: BoostClearanceRequest, db: Session = Depends(get_db)):
    """Boost clearance items"""
    data_api = RetailDataAPI(db)
    
    # Get products in category (or all if no category)
    if request.category:
        products = data_api.get_products_by_category(request.category)
    else:
        products = data_api.get_all_products()
    
    # Create boost rules
    rule_ids = []
    for product in products:
        # Check if already has active rule
        existing_rules = data_api.get_active_rules(item_id=product.item_id)
        if any(r.rule_type == RuleType.BOOST for r in existing_rules):
            continue
        
        rule = data_api.create_rule({
            "item_id": product.item_id,
            "rule_type": RuleType.BOOST,
            "strength": 1.5,  # 50% boost
            "created_by": request.created_by,
        })
        rule_ids.append(rule.id)
    
    # Log audit
    data_api.log_audit(
        action="rules_created",
        entity_type="rule",
        new_value=f"BOOST {len(rule_ids)} items" + (f" in {request.category}" if request.category else ""),
        user=request.created_by
    )
    
    return {"status": "ok", "message": f"Boosted {len(rule_ids)} items", "rule_ids": rule_ids}


# Marketplace Webhooks

@app.post("/integrations/amazon/webhook")
async def amazon_webhook(webhook_data: MarketplaceWebhook, db: Session = Depends(get_db)):
    """Amazon marketplace webhook"""
    data_api = RetailDataAPI(db)
    
    # Upsert product
    product = data_api.upsert_from_marketplace(
        "Amazon IN",
        "amazon",
        {
            "item_id": webhook_data.item_id,
            "title": webhook_data.title or "Amazon Product",
            "category": webhook_data.category or "Unknown",
            "price": webhook_data.price or 0.0,
            "stock": webhook_data.stock or 0,
            "region": "IN",
        }
    )
    
    # Record events
    events = []
    if webhook_data.views:
        events.append({"event_type": EventType.VIEW, "quantity": webhook_data.views})
    if webhook_data.clicks:
        events.append({"event_type": EventType.CLICK, "quantity": webhook_data.clicks})
    if webhook_data.orders:
        events.append({"event_type": EventType.PURCHASE, "quantity": webhook_data.orders, "revenue": (webhook_data.price or 0) * (webhook_data.orders or 0)})
    
    if events:
        data_api.record_marketplace_events(product.item_id, events)
    
    return {"status": "ok", "item_id": product.item_id}


@app.post("/integrations/myntra/webhook")
async def myntra_webhook(webhook_data: MarketplaceWebhook, db: Session = Depends(get_db)):
    """Myntra marketplace webhook"""
    data_api = RetailDataAPI(db)
    
    product = data_api.upsert_from_marketplace(
        "Myntra",
        "myntra",
        {
            "item_id": webhook_data.item_id,
            "title": webhook_data.title or "Myntra Product",
            "category": webhook_data.category or "Apparel",
            "price": webhook_data.price or 0.0,
            "stock": webhook_data.stock or 0,
            "region": "IN",
        }
    )
    
    events = []
    if webhook_data.views:
        events.append({"event_type": EventType.VIEW, "quantity": webhook_data.views})
    if webhook_data.clicks:
        events.append({"event_type": EventType.CLICK, "quantity": webhook_data.clicks})
    if webhook_data.orders:
        events.append({"event_type": EventType.PURCHASE, "quantity": webhook_data.orders, "revenue": (webhook_data.price or 0) * (webhook_data.orders or 0)})
    
    if events:
        data_api.record_marketplace_events(product.item_id, events)
    
    return {"status": "ok", "item_id": product.item_id}


@app.post("/integrations/meesho/webhook")
async def meesho_webhook(webhook_data: MarketplaceWebhook, db: Session = Depends(get_db)):
    """Meesho marketplace webhook"""
    data_api = RetailDataAPI(db)
    
    product = data_api.upsert_from_marketplace(
        "Meesho",
        "meesho",
        {
            "item_id": webhook_data.item_id,
            "title": webhook_data.title or "Meesho Product",
            "category": webhook_data.category or "Unknown",
            "price": webhook_data.price or 0.0,
            "stock": webhook_data.stock or 0,
            "region": "IN",
        }
    )
    
    events = []
    if webhook_data.views:
        events.append({"event_type": EventType.VIEW, "quantity": webhook_data.views})
    if webhook_data.clicks:
        events.append({"event_type": EventType.CLICK, "quantity": webhook_data.clicks})
    if webhook_data.orders:
        events.append({"event_type": EventType.PURCHASE, "quantity": webhook_data.orders, "revenue": (webhook_data.price or 0) * (webhook_data.orders or 0)})
    
    if events:
        data_api.record_marketplace_events(product.item_id, events)
    
    return {"status": "ok", "item_id": product.item_id}


# WebSocket for real-time updates

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            # Echo back or handle client messages
            await websocket.send_text(json.dumps({"type": "pong", "message": "connected"}))
    except WebSocketDisconnect:
        active_connections.remove(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
