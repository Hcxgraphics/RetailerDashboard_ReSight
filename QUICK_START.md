# ReSight Quick Start - Real-Time Retail Engine

## 🚀 Start the System

### 1. Initialize Database

```bash
cd backend
python init_db.py
```

This creates the database with sample Indian marketplace products.

### 2. Start Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

**What happens**:
- ✅ Loads ML model
- ✅ Connects to database
- ✅ Starts mock event generator (generates events every 5 seconds)
- ✅ Starts background ML scoring (every 30 seconds)
- ✅ Enables WebSocket for real-time updates

### 3. Start Frontend

```bash
cd dashboard
npm install
npm run dev
```

Visit `http://localhost:8080` - dashboard updates in real-time!

## 🧪 Test Amazon Webhook

**PowerShell**:
```powershell
cd backend
.\test_webhook.ps1
```

**Bash**:
```bash
curl -X POST http://localhost:8000/integrations/amazon/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ORDER_PLACED",
    "asin": "AMZ-001",
    "price": 1299.0,
    "quantity": 1,
    "region": "IN"
  }'
```

**Expected Results** (within 1 second):
- ✅ Stock reduced
- ✅ Revenue increased
- ✅ Rank recalculated
- ✅ KPIs updated
- ✅ Dashboard refreshes via WebSocket

## 📊 Monitor Real-Time Updates

### Dashboard

1. Open `http://localhost:8080`
2. Look for "Live" indicator (green wifi icon)
3. Watch KPIs update every 30 seconds
4. Send webhook - see instant update!

### Backend Logs

Watch for:
```
INFO: Generated mock view for AMZ-001
INFO: ✓ Recalculated rankings for 5 products
INFO: Running background ML scoring...
```

## 🔄 Mock vs Live Mode

### Mock Mode (Default)
- No stores connected
- Mock generator runs every 5 seconds
- Generates views, clicks, purchases
- Updates stock automatically

### Live Mode
- Store webhook receives data
- Mock generator auto-pauses
- Real events flow through system
- Same dashboard, different data source

**The dashboard never knows the difference!**

## 📡 Webhook Endpoints

### Amazon
```
POST /integrations/amazon/webhook
{
  "eventType": "ORDER_PLACED",
  "asin": "SKU123",
  "price": 999,
  "quantity": 2,
  "region": "IN"
}
```

### Myntra
```
POST /integrations/myntra/webhook
{
  "eventType": "ORDER_PLACED",
  "asin": "MYN-001",
  "price": 499,
  "quantity": 1,
  "region": "IN"
}
```

### Meesho
```
POST /integrations/meesho/webhook
{
  "eventType": "ORDER_PLACED",
  "asin": "MEE-001",
  "price": 299,
  "quantity": 1,
  "region": "IN"
}
```

## 🎯 Key Features

✅ **Real-Time Ranking** - Recalculates on every event
✅ **WebSocket Updates** - Live dashboard without refresh
✅ **Mock Generator** - Auto-generates events when no stores connected
✅ **Webhook Processing** - Instantly updates rankings
✅ **Audit Trail** - All actions logged
✅ **Transparent Mode Switching** - Dashboard doesn't know mock vs live

## 🔍 Verify System

### 1. Check Backend
```bash
curl http://localhost:8000/
# Should return: {"status":"ok",...}
```

### 2. Check Metrics
```bash
curl http://localhost:8000/metrics
# Should return KPIs with revenue, views, clicks
```

### 3. Check Rankings
```bash
curl -X POST http://localhost:8000/rank \
  -H "Content-Type: application/json" \
  -d '{"user_id":"U123","items":[]}'
# Should return ranked products
```

### 4. Check Item Details
```bash
curl http://localhost:8000/item/AMZ-001
# Should return product with ML score and metrics
```

## 🐛 Troubleshooting

### Mock Generator Not Running
- Check logs: Should see "Generated mock..." every 5 seconds
- Verify no stores are active: Check database `stores` table

### WebSocket Not Connecting
- Check browser console for connection status
- Verify backend is running on port 8000
- Frontend falls back to polling if WebSocket fails

### Rankings Not Updating
- Check ML model loaded: `curl http://localhost:8000/`
- Verify database has products: `python -c "from database import *; print(len(SessionLocal().query(Product).all()))"`

## 📈 Production Deployment

See `README_PRODUCTION.md` for:
- PostgreSQL setup
- Azure deployment
- Webhook authentication
- Scaling strategies

---

**ReSight is now a live retail trading terminal!** 🎉

Every event instantly updates rankings, KPIs, and SHAP values.
