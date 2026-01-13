# ReSight Production Setup Guide

## Complete Production System for Indian E-Commerce

This guide sets up ReSight as a production-grade Retail Intelligence Platform connecting Amazon, Myntra, and Meesho marketplaces.

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL (for production) or SQLite (for development)
- ML artifacts in `azureml/` folder

## Step 1: Initialize Database

```bash
cd backend
python init_db.py
```

This creates:
- All database tables
- Sample Indian marketplace products
- Historical events data

## Step 2: Start Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

The backend will:
- Load ML artifacts
- Connect to database
- Start real-time ML scoring (every 30 seconds)
- Enable WebSocket for live updates
- Ready for marketplace webhooks

## Step 3: Start Frontend

```bash
cd dashboard
npm install
npm run dev
```

Frontend will:
- Connect to backend via REST API
- Connect to WebSocket for real-time updates
- Show live KPIs and rankings

## Step 4: Verify System

1. **Backend Health**: `http://localhost:8000/`
2. **Metrics**: `http://localhost:8000/metrics`
3. **Frontend**: `http://localhost:8080/`

## Marketplace Integration

### Amazon Webhook

Configure in Amazon Seller Central:
- Webhook URL: `https://your-api.com/integrations/amazon/webhook`
- Authentication: API key header

### Myntra Webhook

Configure in Myntra Partner Portal:
- Webhook URL: `https://your-api.com/integrations/myntra/webhook`
- Authentication: API key header

### Meesho Webhook

Configure in Meesho Seller Dashboard:
- Webhook URL: `https://your-api.com/integrations/meesho/webhook`
- Authentication: API key header

### Webhook Payload Example

```json
{
  "item_id": "AMZ-001",
  "title": "Boat Wireless Earbuds",
  "category": "Electronics",
  "price": 1299.0,
  "stock": 450,
  "views": 5000,
  "clicks": 500,
  "orders": 50
}
```

## Real-Time Features

### ML Scoring

- Runs every 30 seconds automatically
- Scores all active products
- Applies business rules
- Updates rankings
- Broadcasts via WebSocket

### WebSocket Connection

Frontend automatically connects to:
- `ws://localhost:8000/ws` (development)
- `wss://api.resight.in/ws` (production)

Receives:
- KPI updates every 30 seconds
- Real-time rank changes
- Product updates

## API Endpoints

### Core Endpoints

- `GET /metrics` - Real-time KPIs
- `POST /rank` - Ranked recommendations
- `GET /item/{id}` - Product details
- `GET /explain/{id}` - SHAP explanations
- `POST /whatif/price` - Price simulation
- `POST /rules/pin` - Pin product
- `POST /rules/boost-clearance` - Boost clearance

### Marketplace Webhooks

- `POST /integrations/amazon/webhook`
- `POST /integrations/myntra/webhook`
- `POST /integrations/meesho/webhook`

## Database Schema

### Core Tables

1. **products** - Product catalog
2. **events** - User interactions (views, clicks, purchases)
3. **stores** - Marketplace platforms
4. **rules** - Manual override rules
5. **audit_logs** - Complete audit trail
6. **ml_scores** - Cached ML rankings

## Performance

- **ML Scoring**: ~1-2 seconds for 1000 products
- **API Latency**: <100ms for cached data
- **WebSocket Updates**: Real-time (30s intervals)
- **Database**: Indexed for fast queries

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8000/

# Metrics
curl http://localhost:8000/metrics

# Item details
curl http://localhost:8000/item/AMZ-001
```

### Logs

Backend logs:
- ML scoring cycles
- WebSocket connections
- Webhook events
- Errors

## Troubleshooting

### Database Connection

```bash
# Check SQLite database
sqlite3 backend/retail_data.db ".tables"

# Check PostgreSQL
psql -U user -d resight -c "\dt"
```

### ML Model Loading

Ensure files exist:
```bash
ls -la azureml/
# Should show:
# - lightgbm_ranker.pkl
# - encoders.pkl
# - features.txt
```

### WebSocket Connection

Check browser console:
- Should show "WebSocket connected"
- If disconnected, falls back to polling

## Production Deployment

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/resight
VITE_API_BASE=https://api.resight.in

# Frontend
VITE_API_BASE=https://api.resight.in
```

### Azure Deployment

1. **Backend to Azure Container Apps**
   - Containerize with Docker
   - Set environment variables
   - Configure scaling

2. **Frontend to Azure Static Web Apps**
   - Build: `npm run build`
   - Deploy dist folder
   - Configure custom domain

3. **Database to Azure PostgreSQL**
   - Create managed PostgreSQL instance
   - Configure connection string
   - Set up backups

## Security

- API key authentication for webhooks
- CORS configured for frontend only
- Audit logging for all actions
- Input validation on all endpoints
- SQL injection protection via SQLAlchemy

## Next Steps

1. Configure marketplace webhooks
2. Set up monitoring and alerts
3. Customize business rules
4. Train ML model on your data
5. Scale based on traffic

## Support

For issues:
- Check logs in backend console
- Check browser console for frontend errors
- Verify database connection
- Check ML artifacts are loaded
