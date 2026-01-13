# ReSight Deployment Checklist

## ✅ Pre-Deployment Fixes Applied

### 1. Python Environment ✓
- ✅ SQLAlchemy installed: `sqlalchemy==2.0.36`
- ✅ All dependencies installed from `backend/requirements.txt`
- ✅ Virtualenv Python path: `.venv\Scripts\python.exe`

### 2. Database Initialization ✓
- ✅ Fixed unicode encoding issues in `init_db.py`
- ✅ Database schema created successfully
- ✅ Sample data seeded

### 3. App Imports ✓
- ✅ Database module imports OK
- ✅ App module imports OK
- ✅ All dependencies resolved

### 4. Run Scripts Created ✓
- ✅ `backend/run_server.ps1` - PowerShell run script
- ✅ `backend/run_server.sh` - Bash run script
- ✅ Uses virtualenv Python explicitly

### 5. Frontend Location ✓
- ✅ Frontend in `dashboard/` folder
- ✅ `package.json` exists
- ✅ Run npm from `dashboard/` folder

## 🚀 Deployment Steps

### Step 1: Initialize Database

```powershell
cd D:\RetailerDashboard\retail-reco-system
.venv\Scripts\python.exe backend\init_db.py
```

**Expected Output**:
```
Initializing ReSight database...
[OK] Database tables created

Seeding sample data...
[OK] Database seeded with sample data
[OK] Created 5 products
[OK] Generated sample events

[OK] Database initialization complete!
```

### Step 2: Start Backend

```powershell
cd D:\RetailerDashboard\retail-reco-system\backend
..\.venv\Scripts\python.exe -m uvicorn app:app --reload --port 8000
```

**OR use run script**:
```powershell
cd backend
.\run_server.ps1
```

**Expected Output**:
```
INFO:     Starting ReSight API...
[OK] Loaded model from .../lightgbm_ranker.pkl
[OK] Loaded encoders from .../encoders.pkl
[OK] Loaded 16 features from .../features.txt
[OK] ML artifacts loaded successfully
[OK] Mock event generator started (will pause if stores connect)
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Start Frontend

**In a NEW terminal**:
```powershell
cd D:\RetailerDashboard\retail-reco-system\dashboard
npm install  # Only if first time
npm run dev
```

**Expected Output**:
```
VITE v5.4.19  ready in XXX ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

### Step 4: Verify System

```powershell
cd backend
.\test_deployment.ps1
```

**OR manually test**:
```powershell
# Health check
Invoke-RestMethod http://localhost:8000/

# Metrics
Invoke-RestMethod http://localhost:8000/metrics

# Rankings
$body = @{user_id="U123";items=@()} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/rank -Method Post -Body $body -ContentType "application/json"
```

## 🧪 Test Webhook

```powershell
cd backend
.\test_webhook.ps1
```

**Expected**: 
- ✅ Stock reduced
- ✅ Revenue increased
- ✅ Rankings recalculated
- ✅ Dashboard updates (if connected)

## ⚠️ Common Issues Fixed

### Issue: ModuleNotFoundError: No module named 'sqlalchemy'
**Fix**: Installed all dependencies using `.venv\Scripts\python.exe -m pip install -r backend/requirements.txt`

### Issue: UnicodeEncodeError in init_db.py
**Fix**: Replaced unicode checkmarks (✓) with `[OK]` text markers

### Issue: npm error Could not read package.json
**Fix**: Frontend is in `dashboard/` folder, not root. Run npm from `dashboard/` folder.

### Issue: uvicorn uses wrong Python
**Fix**: Use `.venv\Scripts\python.exe -m uvicorn app:app` instead of global `uvicorn`

## 🔍 Verification

### Backend Health
```powershell
Invoke-RestMethod http://localhost:8000/
# Should return: {"status":"ok","model_loaded":true,...}
```

### Database
```powershell
# Check SQLite database exists
Test-Path backend\retail_data.db
# Should return: True
```

### Frontend
- Visit: `http://localhost:8080/`
- Should show dashboard with live data
- Check browser console for WebSocket connection

## 📝 Notes

- Backend uses virtualenv Python: `.venv\Scripts\python.exe`
- Database is SQLite: `backend/retail_data.db`
- Frontend uses Vite: Runs on port 8080 (or next available)
- WebSocket connects to: `ws://localhost:8000/ws`
- Mock generator runs if no stores connected

## 🎯 Success Criteria

✅ Backend starts without errors
✅ Database initialized with sample data
✅ `/metrics` endpoint returns KPIs
✅ `/rank` endpoint returns recommendations
✅ `/explain/{id}` endpoint returns SHAP values
✅ Webhook processes orders correctly
✅ Frontend loads and shows data
✅ WebSocket connects (shows "Live" indicator)

If all checks pass → System is ready for production!
