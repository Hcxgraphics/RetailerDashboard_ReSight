"""
ReSight Retail Data Store
Database models and core data layer for Indian e-commerce marketplace integrations
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Enum, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

Base = declarative_base()


class EventType(enum.Enum):
    VIEW = "view"
    CLICK = "click"
    PURCHASE = "purchase"
    CART_ADD = "cart_add"
    WISHLIST_ADD = "wishlist_add"


class RuleType(enum.Enum):
    PIN = "pin"
    BOOST = "boost"
    DEMOTE = "demote"
    REMOVE = "remove"


class StorePlatform(enum.Enum):
    AMAZON = "amazon"
    MYNTRA = "myntra"
    MEESHO = "meesho"
    SHOPIFY = "shopify"
    FLIPKART = "flipkart"


# Database Models

class Product(Base):
    """Product catalog from all marketplaces"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(String(100), unique=True, nullable=False, index=True)  # Marketplace SKU
    title = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    main_category = Column(String(100))
    price = Column(Float, nullable=False, index=True)
    stock = Column(Integer, default=0, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    region = Column(String(50), default="IN", index=True)
    
    # ML Features
    verified_purchase = Column(Float, default=0.0)
    helpful_votes = Column(Integer, default=0)
    avg_rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    popularity_bucket = Column(String(50))
    price_bucket = Column(String(50))
    
    # Metadata
    image_url = Column(String(500))
    brand = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    store = relationship("Store", back_populates="products")
    events = relationship("Event", back_populates="product")
    rules = relationship("Rule", back_populates="product")
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "item_id": self.item_id,
            "title": self.title,
            "category": self.category,
            "main_category": self.main_category,
            "price": self.price,
            "stock": self.stock,
            "store": self.store.name if self.store else None,
            "region": self.region,
            "verified_purchase": self.verified_purchase,
            "helpful_votes": self.helpful_votes,
            "avg_rating": self.avg_rating,
            "rating_count": self.rating_count,
            "popularity_bucket": self.popularity_bucket,
            "price_bucket": self.price_bucket,
            "image_url": self.image_url,
            "brand": self.brand,
        }


class Store(Base):
    """E-commerce platforms/stores"""
    __tablename__ = "stores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    platform = Column(Enum(StorePlatform), nullable=False)
    api_key = Column(String(200))  # For webhook authentication
    webhook_url = Column(String(500))
    is_active = Column(Boolean, default=True, index=True)  # Indexed for mock generator check
    connected = Column(Boolean, default=False)  # Whether webhook is actively receiving data
    created_at = Column(DateTime, default=datetime.utcnow)
    
    products = relationship("Product", back_populates="store")


class Event(Base):
    """User interaction events (views, clicks, purchases)"""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), index=True)
    item_id = Column(String(100), ForeignKey("products.item_id"), nullable=False, index=True)
    event_type = Column(Enum(EventType), nullable=False, index=True)
    quantity = Column(Integer, default=1)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    region = Column(String(50), default="IN", index=True)
    revenue = Column(Float, default=0.0)  # For purchase events
    
    # Relationships
    product = relationship("Product", back_populates="events")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "item_id": self.item_id,
            "event_type": self.event_type.value,
            "quantity": self.quantity,
            "timestamp": self.timestamp.isoformat(),
            "region": self.region,
            "revenue": self.revenue,
        }


class Rule(Base):
    """Manual override rules for product ranking"""
    __tablename__ = "rules"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(String(100), ForeignKey("products.item_id"), nullable=False, index=True)
    rule_type = Column(Enum(RuleType), nullable=False)
    strength = Column(Float, default=1.0)  # Multiplier for boost/demote
    expires_at = Column(DateTime)  # Optional expiration
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(100))  # User/admin who created the rule
    
    # Relationships
    product = relationship("Product", back_populates="rules")
    
    def to_dict(self):
        return {
            "id": self.id,
            "item_id": self.item_id,
            "rule_type": self.rule_type.value,
            "strength": self.strength,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "created_at": self.created_at.isoformat(),
            "created_by": self.created_by,
        }


class AuditLog(Base):
    """Audit trail for all system actions"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(50))  # product, rule, metric, etc.
    entity_id = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)
    user = Column(String(100))
    details = Column(Text)
    
    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "action": self.action,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "user": self.user,
            "details": self.details,
        }


class MLScore(Base):
    """Cached ML scores for products (updated every 30s)"""
    __tablename__ = "ml_scores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(String(100), ForeignKey("products.item_id"), nullable=False, unique=True, index=True)
    score = Column(Float, nullable=False)
    rank = Column(Integer, nullable=False, index=True)
    previous_rank = Column(Integer)
    computed_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            "item_id": self.item_id,
            "score": self.score,
            "rank": self.rank,
            "previous_rank": self.previous_rank,
            "computed_at": self.computed_at.isoformat(),
        }


# Database connection
def get_database_url():
    """Get database URL from environment or use SQLite for local dev"""
    import os
    db_url = os.getenv("DATABASE_URL", "sqlite:///./retail_data.db")
    return db_url


engine = create_engine(
    get_database_url(),
    connect_args={"check_same_thread": False} if "sqlite" in get_database_url() else {},
    echo=False  # Set to True for SQL query logging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for FastAPI to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
