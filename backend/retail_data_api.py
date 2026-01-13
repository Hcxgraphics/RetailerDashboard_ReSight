"""
ReSight Retail Data API
Core data access layer for all marketplace integrations and ML operations
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from database import (
    Product, Store, Event, Rule, AuditLog, MLScore,
    EventType, RuleType, StorePlatform
)
import logging

logger = logging.getLogger(__name__)


class RetailDataAPI:
    """Core data access layer for retail operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # Product Operations
    
    def get_all_products(self, active_only: bool = True) -> List[Product]:
        """Get all products, optionally filtered by stock"""
        query = self.db.query(Product)
        if active_only:
            query = query.filter(Product.stock > 0)
        return query.all()
    
    def get_product_by_id(self, item_id: str) -> Optional[Product]:
        """Get product by item_id"""
        return self.db.query(Product).filter(Product.item_id == item_id).first()
    
    def upsert_product(self, product_data: Dict) -> Product:
        """Create or update product from marketplace data"""
        product = self.db.query(Product).filter(Product.item_id == product_data["item_id"]).first()
        
        if product:
            # Update existing
            for key, value in product_data.items():
                if key != "item_id" and hasattr(product, key):
                    setattr(product, key, value)
            product.updated_at = datetime.utcnow()
        else:
            # Create new
            product = Product(**product_data)
            self.db.add(product)
        
        self.db.commit()
        self.db.refresh(product)
        return product
    
    def get_products_by_category(self, category: str) -> List[Product]:
        """Get products by category"""
        return self.db.query(Product).filter(Product.category == category).all()
    
    # Event Operations
    
    def record_event(self, event_data: Dict) -> Event:
        """Record a user interaction event"""
        event = Event(**event_data)
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event
    
    def get_product_metrics(self, item_id: str, days: int = 30) -> Dict:
        """Get aggregated metrics for a product"""
        since = datetime.utcnow() - timedelta(days=days)
        
        events = self.db.query(Event).filter(
            and_(
                Event.item_id == item_id,
                Event.timestamp >= since
            )
        ).all()
        
        views = sum(1 for e in events if e.event_type == EventType.VIEW)
        clicks = sum(1 for e in events if e.event_type == EventType.CLICK)
        purchases = sum(1 for e in events if e.event_type == EventType.PURCHASE)
        revenue = sum(e.revenue for e in events if e.event_type == EventType.PURCHASE)
        
        return {
            "views": views,
            "clicks": clicks,
            "purchases": purchases,
            "revenue": revenue,
            "ctr": (clicks / views * 100) if views > 0 else 0,
            "conversion_rate": (purchases / clicks * 100) if clicks > 0 else 0,
        }
    
    def get_global_kpis(self) -> Dict:
        """Compute global KPIs from events"""
        since = datetime.utcnow() - timedelta(days=30)
        
        # Get all events in the last 30 days
        events = self.db.query(Event).filter(Event.timestamp >= since).all()
        
        views = sum(1 for e in events if e.event_type == EventType.VIEW)
        clicks = sum(1 for e in events if e.event_type == EventType.CLICK)
        purchases = sum(1 for e in events if e.event_type == EventType.PURCHASE)
        revenue = sum(e.revenue for e in events if e.event_type == EventType.PURCHASE)
        
        # Get active products
        active_products = self.db.query(Product).filter(Product.stock > 0).count()
        
        # Calculate changes (mock for now - in production, compare with previous period)
        # TODO: Store historical KPIs for comparison
        revenue_change = 0.0  # Would calculate from historical data
        views_change = 0.0
        clicks_change = 0.0
        
        return {
            "revenue": revenue,
            "revenueChange": revenue_change,
            "views": views,
            "viewsChange": views_change,
            "clicks": clicks,
            "clicksChange": clicks_change,
            "activeProducts": active_products,
            "avgOrderValue": revenue / purchases if purchases > 0 else 0,
        }
    
    # ML Score Operations
    
    def update_ml_scores(self, scores: List[Dict]) -> None:
        """Update cached ML scores (called every 30s by background job)"""
        # Clear old scores
        self.db.query(MLScore).delete()
        
        # Insert new scores with ranks
        for rank, score_data in enumerate(scores, start=1):
            # Get previous rank if exists
            old_score = self.db.query(MLScore).filter(
                MLScore.item_id == score_data["item_id"]
            ).first()
            previous_rank = old_score.rank if old_score else None
            
            ml_score = MLScore(
                item_id=score_data["item_id"],
                score=score_data["score"],
                rank=rank,
                previous_rank=previous_rank,
                computed_at=datetime.utcnow()
            )
            self.db.add(ml_score)
        
        self.db.commit()
    
    def get_product_ml_score(self, item_id: str) -> Optional[MLScore]:
        """Get cached ML score for a product"""
        return self.db.query(MLScore).filter(MLScore.item_id == item_id).first()
    
    def get_ranked_products(self, limit: Optional[int] = None) -> List[Dict]:
        """Get products ranked by ML score"""
        query = self.db.query(MLScore, Product).join(
            Product, MLScore.item_id == Product.item_id
        ).order_by(MLScore.rank)
        
        if limit:
            query = query.limit(limit)
        
        results = []
        for ml_score, product in query.all():
            # Get metrics
            metrics = self.get_product_metrics(ml_score.item_id)
            
            result = {
                "item_id": product.item_id,
                "score": ml_score.score,
                "rank": ml_score.rank,
                "rankChange": (ml_score.previous_rank - ml_score.rank) if ml_score.previous_rank else 0,
                "views": metrics["views"],
                "clicks": metrics["clicks"],
                "revenue": metrics["revenue"],
                "category": product.category,
                "name": product.title,
                "imageUrl": product.image_url,
            }
            results.append(result)
        
        return results
    
    # Rules Operations
    
    def get_active_rules(self, item_id: Optional[str] = None) -> List[Rule]:
        """Get active rules, optionally filtered by item_id"""
        query = self.db.query(Rule).filter(
            or_(
                Rule.expires_at.is_(None),
                Rule.expires_at > datetime.utcnow()
            )
        )
        
        if item_id:
            query = query.filter(Rule.item_id == item_id)
        
        return query.all()
    
    def create_rule(self, rule_data: Dict) -> Rule:
        """Create a new ranking rule"""
        rule = Rule(**rule_data)
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        return rule
    
    def delete_rule(self, rule_id: int) -> bool:
        """Delete a rule"""
        rule = self.db.query(Rule).filter(Rule.id == rule_id).first()
        if rule:
            self.db.delete(rule)
            self.db.commit()
            return True
        return False
    
    def apply_rules_to_scores(self, scored_items: List[Dict]) -> List[Dict]:
        """Apply business rules to ML scores"""
        # Get all active rules
        rules = self.get_active_rules()
        
        # Create lookup by item_id
        rules_by_item = {}
        category_rules = []
        
        for rule in rules:
            if rule.item_id:
                if rule.item_id not in rules_by_item:
                    rules_by_item[rule.item_id] = []
                rules_by_item[rule.item_id].append(rule)
        
        # Apply rules
        result = []
        pinned_items = []
        
        for item in scored_items:
            item_id = item["item_id"]
            item_rules = rules_by_item.get(item_id, [])
            
            # Check for remove rule
            if any(r.rule_type == RuleType.REMOVE for r in item_rules):
                continue  # Skip removed items
            
            # Apply boost/demote
            for rule in item_rules:
                if rule.rule_type == RuleType.BOOST:
                    item["score"] *= rule.strength
                elif rule.rule_type == RuleType.DEMOTE:
                    item["score"] /= rule.strength
            
            # Handle pin
            if any(r.rule_type == RuleType.PIN for r in item_rules):
                pinned_items.append(item)
            else:
                result.append(item)
        
        # Sort by score (descending)
        result.sort(key=lambda x: x["score"], reverse=True)
        
        # Put pinned items at top
        pinned_items.sort(key=lambda x: x["score"], reverse=True)
        final_result = pinned_items + result
        
        # Re-assign ranks
        for rank, item in enumerate(final_result, start=1):
            item["rank"] = rank
        
        return final_result
    
    # Audit Logging
    
    def log_audit(self, action: str, entity_type: str, entity_id: str = None,
                  old_value: str = None, new_value: str = None,
                  user: str = None, details: str = None) -> AuditLog:
        """Create an audit log entry"""
        audit = AuditLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
            user=user,
            details=details
        )
        self.db.add(audit)
        self.db.commit()
        self.db.refresh(audit)
        return audit
    
    def get_audit_logs(self, limit: int = 100) -> List[AuditLog]:
        """Get recent audit logs"""
        return self.db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit).all()
    
    # Marketplace Integration Helpers
    
    def upsert_from_marketplace(self, store_name: str, platform: str, product_data: Dict) -> Product:
        """Upsert product from marketplace webhook"""
        # Get or create store
        store = self.db.query(Store).filter(Store.name == store_name).first()
        if not store:
            store = Store(
                name=store_name,
                platform=StorePlatform[platform.upper()],
                is_active=True
            )
            self.db.add(store)
            self.db.commit()
            self.db.refresh(store)
        
        # Upsert product
        product_data["store_id"] = store.id
        product = self.upsert_product(product_data)
        
        # Log
        self.log_audit(
            action="product_synced",
            entity_type="product",
            entity_id=product.item_id,
            details=f"Synced from {platform} marketplace"
        )
        
        return product
    
    def record_marketplace_events(self, item_id: str, events: List[Dict]) -> None:
        """Record multiple events from marketplace webhook"""
        for event_data in events:
            event_data["item_id"] = item_id
            self.record_event(event_data)
