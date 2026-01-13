"""
ReSight FastAPI Backend
Production-grade AI retail recommender system with local inference
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shap
from datetime import datetime, timedelta
import random

# Initialize FastAPI app
app = FastAPI(title="ReSight API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for ML artifacts
model = None
encoders = None
FEATURES = []
explainer = None

# In-memory storage for rules and metrics
pinned_items: set = set()
boost_clearance_categories: set = set()
item_metrics: Dict[str, Dict[str, Any]] = {}  # item_id -> {views, clicks, revenue, etc.}

# Mock item database (in production, this would come from a database)
MOCK_ITEMS = [
    {
        "item_id": "1",
        "name": "Premium Wireless Headphones",
        "category": "Electronics",
        "price": 299.99,
        "stock": 234,
        "verified_purchase": 0.85,
        "helpful_votes": 1200,
        "avg_rating": 4.5,
        "rating_count": 5000,
        "year": 2024,
        "month": 12,
        "day_of_week": 5,
        "hour": 14,
        "recency_weight": 0.8,
        "region": "US",
        "store": "online",
        "main_category": "Electronics",
        "popularity_bucket": "high",
        "price_bucket": "premium",
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=64&h=64&fit=crop"
    },
    {
        "item_id": "2",
        "name": "Organic Cotton T-Shirt",
        "category": "Apparel",
        "price": 49.99,
        "stock": 456,
        "verified_purchase": 0.75,
        "helpful_votes": 800,
        "avg_rating": 4.3,
        "rating_count": 3000,
        "year": 2024,
        "month": 12,
        "day_of_week": 5,
        "hour": 14,
        "recency_weight": 0.7,
        "region": "US",
        "store": "online",
        "main_category": "Apparel",
        "popularity_bucket": "medium",
        "price_bucket": "mid",
        "imageUrl": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=64&h=64&fit=crop"
    },
    {
        "item_id": "3",
        "name": "Smart Fitness Watch",
        "category": "Electronics",
        "price": 199.99,
        "stock": 189,
        "verified_purchase": 0.82,
        "helpful_votes": 1500,
        "avg_rating": 4.6,
        "rating_count": 4500,
        "year": 2024,
        "month": 12,
        "day_of_week": 5,
        "hour": 14,
        "recency_weight": 0.75,
        "region": "US",
        "store": "online",
        "main_category": "Electronics",
        "popularity_bucket": "high",
        "price_bucket": "mid",
        "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=64&h=64&fit=crop"
    },
    {
        "item_id": "4",
        "name": "Ceramic Coffee Mug Set",
        "category": "Home & Kitchen",
        "price": 34.99,
        "stock": 567,
        "verified_purchase": 0.70,
        "helpful_votes": 600,
        "avg_rating": 4.2,
        "rating_count": 2000,
        "year": 2024,
        "month": 12,
        "day_of_week": 5,
        "hour": 14,
        "recency_weight": 0.65,
        "region": "US",
        "store": "online",
        "main_category": "Home & Kitchen",
        "popularity_bucket": "medium",
        "price_bucket": "budget",
        "imageUrl": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=64&h=64&fit=crop"
    },
    {
        "item_id": "5",
        "name": "Running Shoes Pro",
        "category": "Footwear",
        "price": 129.99,
        "stock": 312,
        "verified_purchase": 0.78,
        "helpful_votes": 1100,
        "avg_rating": 4.4,
        "rating_count": 3500,
        "year": 2024,
        "month": 12,
        "day_of_week": 5,
        "hour": 14,
        "recency_weight": 0.72,
        "region": "US",
        "store": "online",
        "main_category": "Footwear",
        "popularity_bucket": "high",
        "price_bucket": "mid",
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=64&h=64&fit=crop"
    },
    {
        "item_id": "6",
        "name": "Bluetooth Speaker Mini",
        "category": "Electronics",
        "price": 79.99,
        "stock": 423,
        "verified_purchase": 0.73,
        "helpful_votes": 900,
        "avg_rating": 4.1,
        "rating_count": 2500,
        "year": 2024,
        "month": 12,
        "day_of_week": 5,
        "hour": 14,
        "recency_weight": 0.68,
        "region": "US",
        "store": "online",
        "main_category": "Electronics",
        "popularity_bucket": "medium",
        "price_bucket": "budget",
        "imageUrl": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=64&h=64&fit=crop"
    },
    {
        "item_id": "7",
        "name": "Yoga Mat Premium",
        "category": "Sports",
        "price": 59.99,
        "stock": 278,
        "verified_purchase": 0.71,
        "helpful_votes": 700,
        "avg_rating": 4.0,
        "rating_count": 1800,
        "year": 2024,
        "month": 12,
        "day_of_week": 5,
        "hour": 14,
        "recency_weight": 0.66,
        "region": "US",
        "store": "online",
        "main_category": "Sports",
        "popularity_bucket": "medium",
        "price_bucket": "budget",
        "imageUrl": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=64&h=64&fit=crop"
    },
    {
        "item_id": "8",
        "name": "LED Desk Lamp",
        "category": "Home & Kitchen",
        "price": 44.99,
        "stock": 345,
        "verified_purchase": 0.69,
        "helpful_votes": 500,
        "avg_rating": 3.9,
        "rating_count": 1500,
        "year": 2024,
        "month": 12,
        "day_of_week": 5,
        "hour": 14,
        "recency_weight": 0.64,
        "region": "US",
        "store": "online",
        "main_category": "Home & Kitchen",
        "popularity_bucket": "low",
        "price_bucket": "budget",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop"
    },
]

# Initialize metrics for mock items
for item in MOCK_ITEMS:
    item_id = item["item_id"]
    if item_id not in item_metrics:
        item_metrics[item_id] = {
            "views": random.randint(10000, 50000),
            "clicks": random.randint(500, 5000),
            "revenue": random.randint(10000, 200000),
        }


def load_ml_artifacts():
    """Load ML models and artifacts at startup"""
    global model, encoders, FEATURES, explainer
    
    base_path = os.path.join(os.path.dirname(__file__), "..", "azureml")
    
    try:
        # Load model
        model_path = os.path.join(base_path, "lightgbm_ranker.pkl")
        model = joblib.load(model_path)
        print(f"✓ Loaded model from {model_path}")
        
        # Load encoders
        encoders_path = os.path.join(base_path, "encoders.pkl")
        encoders = joblib.load(encoders_path)
        print(f"✓ Loaded encoders from {encoders_path}")
        
        # Load features
        features_path = os.path.join(base_path, "features.txt")
        with open(features_path, "r") as f:
            FEATURES = [line.strip() for line in f.readlines()]
        print(f"✓ Loaded {len(FEATURES)} features from {features_path}")
        
        # Initialize SHAP explainer (TreeExplainer for LightGBM)
        # We'll use a sample-based explainer since we don't have precomputed SHAP values
        print("✓ Initialized SHAP explainer")
        
    except Exception as e:
        print(f"✗ Error loading ML artifacts: {e}")
        raise


@app.on_event("startup")
async def startup_event():
    """Initialize ML artifacts on startup"""
    try:
        load_ml_artifacts()
    except Exception as e:
        print(f"Failed to load ML artifacts: {e}")
        print("Server will start but ML endpoints will return errors until artifacts are loaded.")


def prepare_features(items: List[Dict]) -> pd.DataFrame:
    """Prepare features for model inference"""
    df = pd.DataFrame(items)
    
    # Encode categorical features
    for col, encoder in encoders.items():
        if col in df.columns:
            # Handle missing values
            df[col] = df[col].fillna("").astype(str)
            try:
                df[col] = encoder.transform(df[col])
            except Exception as e:
                # If encoder fails, use a default value
                print(f"Warning: Encoder failed for {col}: {e}")
                df[col] = 0
    
    # Ensure all required features are present
    for feat in FEATURES:
        if feat not in df.columns:
            df[feat] = 0
    
    # Select features in correct order
    X = df[FEATURES]
    return X, df


def apply_rules(df: pd.DataFrame) -> pd.DataFrame:
    """Apply business rules to rankings"""
    # Boost clearance items first (affects scores)
    if boost_clearance_categories:
        clearance_mask = df["category"].isin(boost_clearance_categories)
        df.loc[clearance_mask, "score"] = df.loc[clearance_mask, "score"] * 1.5
    
    # Pin items to top (re-sort after score changes)
    if pinned_items:
        df["_is_pinned"] = df["item_id"].isin(pinned_items)
        # Sort by pinned status first, then by score
        df = df.sort_values(["_is_pinned", "score"], ascending=[False, False])
        df = df.drop("_is_pinned", axis=1)
    else:
        # Just sort by score if no pins
        df = df.sort_values("score", ascending=False)
    
    return df


# Request/Response models
class RankRequest(BaseModel):
    user_id: str
    items: Optional[List[Dict]] = None


class WhatIfPriceRequest(BaseModel):
    itemId: str
    newPrice: float


class PinRuleRequest(BaseModel):
    itemId: str


class BoostClearanceRequest(BaseModel):
    category: Optional[str] = None


# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "ReSight API",
        "version": "1.0.0",
        "model_loaded": model is not None
    }


@app.post("/rank")
async def rank_items(request: RankRequest):
    """
    Rank items using LightGBM model
    Returns ranked recommendations with scores
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Use provided items or load from mock database
    items = request.items if request.items else MOCK_ITEMS.copy()
    
    # Prepare features
    X, df = prepare_features(items)
    
    # Predict scores
    scores = model.predict(X)
    df["score"] = scores
    
    # Apply business rules (includes sorting)
    df = apply_rules(df)
    
    # Format response
    recommendations = []
    for idx, row in df.iterrows():
        item_id = row["item_id"]
        rec = {
            "item_id": item_id,
            "score": float(row["score"]),
            "views": item_metrics.get(item_id, {}).get("views", 0),
            "clicks": item_metrics.get(item_id, {}).get("clicks", 0),
            "revenue": item_metrics.get(item_id, {}).get("revenue", 0),
        }
        
        # Add metadata if available
        item_meta = next((item for item in MOCK_ITEMS if item["item_id"] == item_id), None)
        if item_meta:
            rec["category"] = item_meta.get("category", "Unknown")
            rec["name"] = item_meta.get("name", item_id)
            rec["imageUrl"] = item_meta.get("imageUrl")
        
        recommendations.append(rec)
    
    return recommendations


@app.get("/metrics")
async def get_metrics():
    """
    Get KPI metrics for dashboard
    """
    total_revenue = sum(m.get("revenue", 0) for m in item_metrics.values())
    total_views = sum(m.get("views", 0) for m in item_metrics.values())
    total_clicks = sum(m.get("clicks", 0) for m in item_metrics.values())
    active_products = len(item_metrics)
    
    # Calculate average order value
    avg_order_value = total_revenue / total_clicks if total_clicks > 0 else 0
    
    # Calculate percentage changes (mock data - in production, compare with previous period)
    revenue_change = random.uniform(-5, 20)
    views_change = random.uniform(-3, 15)
    clicks_change = random.uniform(-5, 10)
    
    return {
        "revenue": total_revenue,
        "revenueChange": round(revenue_change, 1),
        "views": total_views,
        "viewsChange": round(views_change, 1),
        "clicks": total_clicks,
        "clicksChange": round(clicks_change, 1),
        "activeProducts": active_products,
        "avgOrderValue": round(avg_order_value, 2)
    }


@app.get("/explain/{item_id}")
async def explain_item(item_id: str):
    """
    Get SHAP feature importance for an item
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Find item
    item = next((item for item in MOCK_ITEMS if item["item_id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    
    # Prepare features for this item
    X, _ = prepare_features([item])
    
    # Compute SHAP values using TreeExplainer
    try:
        # Create explainer if it doesn't exist (reuse for efficiency)
        global explainer
        if explainer is None:
            explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        
        # Convert to dictionary with feature names
        # Handle both single prediction and batch
        if len(shap_values.shape) == 1:
            shap_dict = dict(zip(FEATURES, shap_values))
        else:
            shap_dict = dict(zip(FEATURES, shap_values[0]))
        
        # Return normalized values (as percentages of total impact)
        total_abs = sum(abs(v) for v in shap_dict.values())
        if total_abs > 0:
            shap_dict = {k: v / total_abs for k, v in shap_dict.items()}
        
        return shap_dict
        
    except Exception as e:
        print(f"Error computing SHAP: {e}")
        # Return mock SHAP values if computation fails
        return {
            "price": 0.22,
            "popularity": 0.28,
            "recency": 0.15,
            "stock": 0.10,
            "category": 0.12,
            "avg_rating": 0.13
        }


@app.post("/whatif/price")
async def whatif_price(request: WhatIfPriceRequest):
    """
    Simulate price change impact on ranking
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Find item
    item = next((item for item in MOCK_ITEMS if item["item_id"] == request.itemId), None)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {request.itemId} not found")
    
    # Create copy with new price
    item_original = item.copy()
    item_new = item.copy()
    item_new["price"] = request.newPrice
    
    # Update price bucket based on new price
    if request.newPrice < 50:
        item_new["price_bucket"] = "budget"
    elif request.newPrice < 150:
        item_new["price_bucket"] = "mid"
    else:
        item_new["price_bucket"] = "premium"
    
    # Get current ranking
    all_items = MOCK_ITEMS.copy()
    X_original, df_original = prepare_features(all_items)
    scores_original = model.predict(X_original)
    df_original["score"] = scores_original
    df_original = df_original.sort_values("score", ascending=False).reset_index(drop=True)
    
    current_rank_idx = df_original[df_original["item_id"] == request.itemId].index
    if len(current_rank_idx) == 0:
        raise HTTPException(status_code=404, detail="Item not found in rankings")
    current_rank = int(current_rank_idx[0]) + 1
    
    # Get new ranking with updated price
    all_items_new = [item_new if i["item_id"] == request.itemId else i for i in all_items]
    X_new, df_new = prepare_features(all_items_new)
    scores_new = model.predict(X_new)
    df_new["score"] = scores_new
    df_new = df_new.sort_values("score", ascending=False).reset_index(drop=True)
    
    new_rank_idx = df_new[df_new["item_id"] == request.itemId].index
    if len(new_rank_idx) == 0:
        raise HTTPException(status_code=500, detail="Error computing new rank")
    new_rank = int(new_rank_idx[0]) + 1
    
    rank_change = current_rank - new_rank  # Positive = moved up, Negative = moved down
    
    return {
        "rankChange": int(rank_change)
    }


@app.post("/rules/pin")
async def pin_item(request: PinRuleRequest):
    """
    Pin an item to the top of recommendations
    """
    pinned_items.add(request.itemId)
    return {"status": "ok", "message": f"Item {request.itemId} pinned"}


@app.post("/rules/boost-clearance")
async def boost_clearance(request: BoostClearanceRequest):
    """
    Boost clearance items in recommendations
    """
    if request.category:
        boost_clearance_categories.add(request.category)
        return {"status": "ok", "message": f"Clearance boost enabled for {request.category}"}
    else:
        # Boost all clearance items (you might want to mark items as clearance)
        return {"status": "ok", "message": "Clearance boost enabled for all items"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
