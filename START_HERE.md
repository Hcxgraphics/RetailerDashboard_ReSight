# 🚀 ReSight - Start Here

## ✅ All Fixes Applied

The system has been repaired and is ready to run. All critical issues have been fixed.

## 🛠️ Quick Start (3 Steps)

### Step 1: Initialize Database
```powershell
cd D:\RetailerDashboard\retail-reco-system
.venv\Scripts\python.exe backend\init_db.py
```

### Step 2: Start Backend
```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn app:app --reload --port 8000
```

**OR use the run script**:
```powershell
cd backend
.\run_server.ps1
```

### Step 3: Start Frontend (New Terminal)
```powershell
cd dashboard
npm run dev
```

## ✅ What Was Fixed

1. **Python Environment** ✓
   - SQLAlchemy installed (v2.0.36)
   - All dependencies installed
   - Virtualenv Python path configured

2. **Uvicorn Import Error** ✓
   - Run script created: `backend/run_server.ps1`
   - Uses virtualenv Python explicitly
   - Command: `.venv\Scripts\python.exe -m uvicorn app:app`

3. **Frontend NPM Error** ✓
   - Frontend is in `dashboard/` folder
   - Run npm from `dashboard/` folder

4. **Unicode Encoding** ✓
   - Fixed unicode checkmarks in `init_db.py`
   - Fixed unicode in `app.py` logger

5. **Database Initialization** ✓
   - Database creates successfully
   - Sample data seeds correctly

## 🧪 Test the System

### Quick Test
```powershell
cd backend
.\test_deployment.ps1
```

### Manual Test
```powershell
# Health check
Invoke-RestMethod http://localhost:8000/

# Metrics
Invoke-RestMethod http://localhost:8000/metrics

# Rankings
$body = @{user_id="U123";items=@()} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/rank -Method Post -Body $body -ContentType "application/json"

# Test webhook
.\test_webhook.ps1
```

## 📋 System Architecture

```
Marketplace Webhooks (or Mock Generator)
                ↓
FastAPI Backend (app.py)
                ↓
Retail Data API (retail_data_api.py)
                ↓
SQLite Database (retail_data.db)
                ↓
LightGBM ML Model
                ↓
React Dashboard (dashboard/)
```

## 🎯 Key Features

- ✅ **Mock Mode**: Auto-generates events when no stores connected
- ✅ **Live Mode**: Processes real marketplace webhooks
- ✅ **Real-Time Ranking**: Recalculates on every event
- ✅ **WebSocket Updates**: Live dashboard updates
- ✅ **SHAP Explainability**: Feature importance for each item
- ✅ **What-If Simulation**: Price change impact analysis
- ✅ **Rules Engine**: Pin, boost, demote products

## 📝 Important Notes

- **Backend Python**: Always use `.venv\Scripts\python.exe`
- **Frontend Location**: `dashboard/` folder
- **Database**: SQLite at `backend/retail_data.db`
- **WebSocket**: Connects to `ws://localhost:8000/ws`

## 🐛 If Issues Occur

1. Check Python: `.venv\Scripts\python.exe --version`
2. Check dependencies: `.venv\Scripts\python.exe -m pip list`
3. Check database: `Test-Path backend\retail_data.db`
4. Check imports: `.venv\Scripts\python.exe -c "import sys; sys.path.insert(0, 'backend'); from app import app"`

## 📚 Documentation

- `DEPLOYMENT_CHECKLIST.md` - Full deployment guide
- `FIXES_APPLIED.md` - Detailed fix documentation
- `REALTIME_ENGINE.md` - Architecture details
- `QUICK_START.md` - Quick reference

---

**System is ready!** Start with Step 1 above.
