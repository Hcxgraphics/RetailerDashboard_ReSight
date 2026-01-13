"""
Mock Data Generator for ReSight
Generates realistic marketplace events when no stores are connected
"""

import asyncio
import random
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, Product, Event, EventType, Store
from retail_data_api import RetailDataAPI
import logging

logger = logging.getLogger(__name__)


async def mock_event_generator():
    """
    Background job: Generate mock marketplace events
    Runs only when no stores are connected (store.connected == False)
    """
    db = SessionLocal()
    data_api = RetailDataAPI(db)
    
    while True:
        try:
            # Check if any store is connected (either is_active or connected flag)
            connected_stores = db.query(Store).filter(
                (Store.is_active == True) | (Store.connected == True)
            ).count()
            
            # Only run mock generator if no stores connected
            if connected_stores > 0:
                logger.info("Store connected - mock generator paused")
                await asyncio.sleep(60)  # Check every minute
                continue
            
            # Get random product
            products = data_api.get_all_products(active_only=True)
            if not products:
                logger.warning("No products found for mock generation")
                await asyncio.sleep(30)
                continue
            
            product = random.choice(products)
            event_type = random.choice([
                EventType.VIEW,
                EventType.VIEW,
                EventType.VIEW,  # Views are more common
                EventType.CLICK,
                EventType.CLICK,
                EventType.PURCHASE,
            ])
            
            quantity = 1
            revenue = 0.0
            
            if event_type == EventType.PURCHASE:
                quantity = random.randint(1, 3)
                revenue = product.price * quantity
                
                # Update stock
                product.stock = max(0, product.stock - quantity)
                db.commit()
                db.refresh(product)
            
            # Record event
            event_data = {
                "user_id": f"user_{random.randint(1, 1000)}",
                "item_id": product.item_id,
                "event_type": event_type,
                "quantity": quantity,
                "timestamp": datetime.utcnow(),
                "region": product.region or "IN",
                "revenue": revenue,
            }
            
            data_api.record_event(event_data)
            
            # Trigger ranking recalculation
            await trigger_ranking_recalc(db, data_api)
            
            # Log mock event
            data_api.log_audit(
                action="mock_event_generated",
                entity_type="event",
                entity_id=product.item_id,
                details=f"Generated {event_type.value} event for {product.item_id}",
            )
            
            logger.info(f"[MOCK] Generated {event_type.value} for {product.item_id}")
            
            # Wait 5 seconds before next event
            await asyncio.sleep(5)
            
        except Exception as e:
            logger.error(f"Error in mock event generator: {e}")
            await asyncio.sleep(10)


async def trigger_ranking_recalc(db: Session, data_api: RetailDataAPI):
    """
    Trigger immediate ranking recalculation after event
    This ensures real-time updates to dashboard
    """
    try:
        # Import from app module (avoid circular dependency)
        import app
        
        if app.model is None:
            logger.warning("Model not loaded, skipping recalculation")
            return
        
        # Call recalculation with database session
        await app.recalc_rankings_with_db(db, data_api)
        
    except Exception as e:
        logger.error(f"Error triggering ranking recalculation: {e}")


def start_mock_generator():
    """Start the mock event generator as background task"""
    logger.info("Starting mock event generator...")
    asyncio.create_task(mock_event_generator())
