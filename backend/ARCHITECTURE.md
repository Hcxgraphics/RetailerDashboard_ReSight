# ReSight Architecture

## System Overview

ReSight is a real-time Retail Intelligence Platform for Indian e-commerce that connects marketplace data to AI-powered insights.

## Architecture Flow

```
Indian Marketplaces (Amazon, Myntra, Meesho)
    ↓ (Webhooks)
Retail Data API (database.py + retail_data_api.py)
    ↓ (SQLAlchemy ORM)
PostgreSQL/SQLite Database
    ↓ (Read operations)
ML Inference Engine (LightGBM + SHAP)
    ↓ (Scores + Explanations)
FastAPI Backend (app.py)
    ↓ (REST API + WebSocket)
React Dashboard (Frontend)
```

## Components

### 1. Retail Data Store (`database.py`)
- SQLAlchemy models for all entities
- Products, Events, Stores, Rules, AuditLogs, MLScores
- Database connection and session management

### 2. Retail Data API (`retail_data_api.py`)
- Core data access layer
- CRUD operations for all entities
- KPI computation from events
- Rules engine integration
- Marketplace data normalization

### 3. ML Inference Engine (`app.py`)
- LightGBM model loading
- Feature preparation and encoding
- Real-time scoring every 30 seconds
- SHAP explainability
- What-If simulations

### 4. FastAPI Backend (`app.py`)
- REST API endpoints
- WebSocket for real-time updates
- Background tasks for ML scoring
- Marketplace webhook handlers
- Audit logging

### 5. React Frontend (`dashboard/`)
- Real-time KPI dashboard
- Product inspector with SHAP
- What-If price simulator
- Rules management
- Audit log viewer

## Data Flow

### Real-Time KPI Updates
1. Background task runs every 30 seconds
2. Loads all active products from database
3. Scores with LightGBM model
4. Applies business rules
5. Updates ML scores cache
6. Computes KPIs from events
7. Broadcasts via WebSocket to connected clients

### Marketplace Integration
1. Webhook receives data from marketplace
2. Normalizes to common format
3. Upserts product in database
4. Records events (views, clicks, orders)
5. Triggers re-scoring in next cycle

### Item Inspection
1. User clicks item in UI
2. Frontend requests: `GET /item/{id}`
3. Backend queries:
   - Product data
   - ML score and rank
   - Metrics (views, clicks, revenue)
   - Rules applied
4. Returns combined response
5. Frontend requests: `GET /explain/{id}` for SHAP
6. Backend computes SHAP values
7. Returns feature importance

### What-If Simulation
1. User changes price in UI
2. Frontend sends: `POST /whatif/price`
3. Backend:
   - Gets all products
   - Modifies target product price
   - Re-runs ML inference
   - Applies rules
   - Compares ranks
4. Returns rank change

### Rules Engine
1. Retailer creates rule (pin, boost, demote)
2. Stored in database
3. Applied during ML scoring cycle
4. Rules modify scores before ranking
5. Pinned items always at top
6. All rule actions logged in audit_logs

## Database Schema

### products
- Product catalog from all marketplaces
- Stores price, stock, category, ratings
- ML features (popularity, price buckets, etc.)

### events
- User interaction events
- Views, clicks, purchases with timestamps
- Used for KPI computation

### stores
- Marketplace/platform information
- Amazon, Myntra, Meesho, etc.

### rules
- Manual override rules
- Pin, boost, demote, remove
- Applied during ranking

### audit_logs
- Complete audit trail
- All system actions logged
- Changes tracked with old/new values

### ml_scores
- Cached ML scores
- Updated every 30 seconds
- Includes rank and rank changes

## API Endpoints

### Public
- `GET /` - Health check
- `GET /metrics` - Real-time KPIs
- `POST /rank` - Ranked recommendations
- `GET /item/{id}` - Item details
- `GET /explain/{id}` - SHAP explanations
- `POST /whatif/price` - Price simulation
- `POST /rules/pin` - Pin item
- `POST /rules/boost-clearance` - Boost clearance

### Marketplace Webhooks
- `POST /integrations/amazon/webhook`
- `POST /integrations/myntra/webhook`
- `POST /integrations/meesho/webhook`

### Real-Time
- `WS /ws` - WebSocket for live updates

## Deployment

### Local Development
1. Initialize database: `python init_db.py`
2. Start backend: `uvicorn app:app --reload --port 8000`
3. Start frontend: `cd dashboard && npm run dev`

### Production
1. Use PostgreSQL instead of SQLite
2. Set `DATABASE_URL` environment variable
3. Run migrations
4. Deploy backend to Azure Container Apps
5. Deploy frontend to Azure Static Web Apps
6. Configure marketplace webhooks

## Performance

- ML scoring: ~30 seconds for 1000 products
- API latency: <100ms for cached data
- WebSocket updates: Real-time (30s intervals)
- Database: Optimized with indexes on item_id, timestamp, category

## Security

- Webhook authentication (API keys)
- Audit logging for all actions
- Input validation on all endpoints
- CORS configured for frontend only
