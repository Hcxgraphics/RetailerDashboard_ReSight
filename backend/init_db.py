"""
Initialize ReSight database with sample data
Run this once to set up the database
"""

from database import init_db, get_db, Product, Store, Event, Rule, StorePlatform, EventType
from retail_data_api import RetailDataAPI
from datetime import datetime, timedelta
import random

def seed_sample_data():
    """Seed database with sample Indian marketplace products"""
    db = next(get_db())
    data_api = RetailDataAPI(db)
    
    # Create stores
    stores = {
        "Demo Marketplace A": StorePlatform.AMAZON,
        "Demo Marketplace B": StorePlatform.MYNTRA,
        "Demo Marketplace C": StorePlatform.MEESHO,
    }
    
    created_stores = {}
    for store_name, platform in stores.items():
        store = db.query(Store).filter(Store.name == store_name).first()
        if not store:
            store = Store(name=store_name, platform=platform, is_active=True)
            db.add(store)
            db.commit()
            db.refresh(store)
        created_stores[store_name] = store
    
    # Sample products for Indian marketplaces
    sample_products = [
        {
            "item_id": "AMZ-001",
            "title": "Boat Wireless Earbuds - BassHeads",
            "category": "Electronics",
            "main_category": "Electronics",
            "price": 1299.0,
            "stock": 450,
            "store_id": created_stores["Demo Marketplace A"].id,
            "region": "IN",
            "verified_purchase": 0.82,
            "helpful_votes": 2500,
            "avg_rating": 4.3,
            "rating_count": 12000,
            "popularity_bucket": "high",
            "price_bucket": "mid",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=64&h=64&fit=crop",
            "brand": "Boat",
        },
        {
            "item_id": "MYN-001",
            "title": "Cotton Casual T-Shirt - Multi Color",
            "category": "Apparel",
            "main_category": "Apparel",
            "price": 499.0,
            "stock": 1200,
            "store_id": created_stores["Demo Marketplace B"].id,
            "region": "IN",
            "verified_purchase": 0.75,
            "helpful_votes": 800,
            "avg_rating": 4.2,
            "rating_count": 5000,
            "popularity_bucket": "high",
            "price_bucket": "budget",
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=64&h=64&fit=crop",
        },
        {
            "item_id": "MEE-001",
            "title": "Kurti Set - Printed",
            "category": "Apparel",
            "main_category": "Women's Fashion",
            "price": 299.0,
            "stock": 800,
            "store_id": created_stores["Demo Marketplace C"].id,
            "region": "IN",
            "verified_purchase": 0.68,
            "helpful_votes": 450,
            "avg_rating": 3.9,
            "rating_count": 3000,
            "popularity_bucket": "medium",
            "price_bucket": "budget",
            "image_url": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=64&h=64&fit=crop",
        },
        {
            "item_id": "AMZ-002",
            "title": "Realme Smartphone - 8GB RAM",
            "category": "Electronics",
            "main_category": "Electronics",
            "price": 14999.0,
            "stock": 125,
            "store_id": created_stores["Demo Marketplace A"].id,
            "region": "IN",
            "verified_purchase": 0.88,
            "helpful_votes": 5000,
            "avg_rating": 4.5,
            "rating_count": 25000,
            "popularity_bucket": "high",
            "price_bucket": "mid",
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=64&h=64&fit=crop",
            "brand": "Realme",
        },
        {
            "item_id": "MYN-002",
            "title": "Sports Shoes - Running",
            "category": "Footwear",
            "main_category": "Footwear",
            "price": 1999.0,
            "stock": 350,
            "store_id": created_stores["Demo Marketplace B"].id,
            "region": "IN",
            "verified_purchase": 0.80,
            "helpful_votes": 1800,
            "avg_rating": 4.4,
            "rating_count": 8000,
            "popularity_bucket": "high",
            "price_bucket": "mid",
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=64&h=64&fit=crop",
        },
    ]
    
    # Insert products
    for product_data in sample_products:
        existing = data_api.get_product_by_id(product_data["item_id"])
        if not existing:
            data_api.upsert_product(product_data)
    
    # Generate sample events
    print("Generating sample events...")
    for product_data in sample_products:
        item_id = product_data["item_id"]
        
        # Generate events for last 30 days
        for day in range(30):
            date = datetime.utcnow() - timedelta(days=day)
            
            # Views
            views_count = random.randint(100, 5000)
            for _ in range(min(views_count, 100)):  # Limit individual inserts
                data_api.record_event({
                    "user_id": f"user_{random.randint(1, 1000)}",
                    "item_id": item_id,
                    "event_type": EventType.VIEW,
                    "timestamp": date,
                    "region": "IN",
                })
            
            # Clicks
            clicks_count = random.randint(10, 500)
            for _ in range(min(clicks_count, 50)):
                data_api.record_event({
                    "user_id": f"user_{random.randint(1, 1000)}",
                    "item_id": item_id,
                    "event_type": EventType.CLICK,
                    "timestamp": date,
                    "region": "IN",
                })
            
            # Purchases
            purchases_count = random.randint(1, 50)
            price = product_data["price"]
            for _ in range(min(purchases_count, 20)):
                quantity = random.randint(1, 3)
                data_api.record_event({
                    "user_id": f"user_{random.randint(1, 1000)}",
                    "item_id": item_id,
                    "event_type": EventType.PURCHASE,
                    "quantity": quantity,
                    "revenue": price * quantity,
                    "timestamp": date,
                    "region": "IN",
                })
    
    print("[OK] Database seeded with sample data")
    print(f"[OK] Created {len(sample_products)} products")
    print("[OK] Generated sample events")


if __name__ == "__main__":
    print("Initializing ReSight database...")
    init_db()
    print("[OK] Database tables created")
    
    print("\nSeeding sample data...")
    seed_sample_data()
    print("\n[OK] Database initialization complete!")
