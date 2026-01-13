# ReSight Production Setup Guide

## Quick Start

### 1. Initialize Database

```bash
cd backend
python init_db.py
```

This creates the database schema and seeds sample Indian marketplace data.

### 2. Start Backend

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

The backend will:
- Load ML artifacts from `../azureml/`
- Initialize database connection
- Start background ML scoring (every 30 seconds)
- Enable WebSocket for real-time updates

### 3. Start Frontend

```bash
cd dashboard
npm install
npm run dev
```

Frontend connects to backend at `http://localhost:8000` (configured in `.env`)

## Production Deployment

### Database

For production, use PostgreSQL:

```bash
# Install PostgreSQL client
pip install psycopg2-binary

# Set environment variable
export DATABASE_URL=postgresql://user:password@localhost:5432/resight

# Run migrations
python init_db.py
```

### Environment Variables

```bash
# Backend (.env or environment)
DATABASE_URL=postgresql://user:pass@host:5432/resight
VITE_API_BASE=https://api.resight.in

# Frontend (dashboard/.env)
VITE_API_BASE=https://api.resight.in
```

### Azure Deployment

1. **Backend (Azure Container Apps)**
   ```bash
   # Build Docker image
   docker build -t resight-backend .
   
   # Push to Azure Container Registry
   az acr build --registry <registry> --image resight-backend .
   
   # Deploy to Container Apps
   az containerapp create \
     --name resight-api \
     --resource-group <rg> \
     --image <registry>.azurecr.io/resight-backend \
     --env-vars DATABASE_URL=$DATABASE_URL
   ```

2. **Frontend (Azure Static Web Apps)**
   ```bash
   cd dashboard
   npm run build
   az staticwebapp deploy \
     --name resight-dashboard \
     --resource-group <rg> \
     --app-location "./" \
     --output-location "dist"
   ```

## Marketplace Integration

### Webhook Setup

Each marketplace requires webhook configuration:

#### Amazon
- Webhook URL: `https://api.resight.in/integrations/amazon/webhook`
- Authentication: API key in header
- Format: See `MarketplaceWebhook` model in `app.py`

#### Myntra
- Webhook URL: `https://api.resight.in/integrations/myntra/webhook`
- Authentication: API key in header

#### Meesho
- Webhook URL: `https://api.resight.in/integrations/meesho/webhook`
- Authentication: API key in header

### Webhook Payload Format

```json
{
  "item_id": "AMZ-001",
  "title": "Product Title",
  "category": "Electronics",
  "price": 1299.0,
  "stock": 450,
  "views": 5000,
  "clicks": 500,
  "orders": 50
}
```

## Real-Time Features

### WebSocket Connection

Frontend connects to `ws://localhost:8000/ws` (or `wss://api.resight.in/ws` in production)

### Update Frequency

- ML Scoring: Every 30 seconds
- KPI Updates: Broadcasted via WebSocket after each scoring cycle
- UI Polling: Fallback every 30 seconds if WebSocket disconnected

## Monitoring

### Health Check

```bash
curl http://localhost:8000/
```

### Metrics

Monitor via:
- `GET /metrics` - Real-time KPIs
- Database query performance
- WebSocket connection count
- ML scoring latency

## Troubleshooting

### Database Connection Issues

```bash
# Check connection
python -c "from database import get_db; next(get_db())"
```

### ML Model Loading

Ensure files exist:
- `azureml/lightgbm_ranker.pkl`
- `azureml/encoders.pkl`
- `azureml/features.txt`

### WebSocket Connection

Check browser console for connection status. Fallback to polling if WebSocket fails.

## Performance Tuning

### Database Indexes

Already created on:
- `products.item_id`
- `events.item_id`, `events.timestamp`, `events.event_type`
- `ml_scores.item_id`, `ml_scores.rank`

### ML Scoring

For large catalogs (>10,000 products):
- Increase background task interval (currently 30s)
- Use batch scoring optimization
- Consider caching strategies

## Security

### Webhook Authentication

Add API key validation in webhook handlers:

```python
@app.post("/integrations/amazon/webhook")
async def amazon_webhook(webhook_data: MarketplaceWebhook, 
                        api_key: str = Header(...),
                        db: Session = Depends(get_db)):
    # Validate API key
    if not validate_api_key(api_key, "amazon"):
        raise HTTPException(status_code=401, detail="Invalid API key")
    # ... rest of handler
```

### CORS

Update CORS origins in `app.py` for production:

```python
allow_origins=["https://dashboard.resight.in"]
```

## Scaling

### Horizontal Scaling

- Multiple backend instances behind load balancer
- Shared PostgreSQL database
- Redis for WebSocket connection management (if needed)

### Vertical Scaling

- Increase ML scoring batch size
- Optimize database queries
- Use connection pooling
