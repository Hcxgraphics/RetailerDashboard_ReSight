# ReSight Quick Start Guide

## Prerequisites

- Python 3.8+ (for backend)
- Node.js 18+ and npm (for frontend)
- ML artifacts in `azureml/` folder:
  - `lightgbm_ranker.pkl`
  - `encoders.pkl`
  - `features.txt`

## Step 1: Start Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

You should see:
```
✓ Loaded model from .../azureml/lightgbm_ranker.pkl
✓ Loaded encoders from .../azureml/encoders.pkl
✓ Loaded 16 features from .../azureml/features.txt
✓ Initialized SHAP explainer
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 2: Start Frontend

In a new terminal:

```bash
cd dashboard
npm install  # Only needed first time
npm run dev
```

Frontend will start on `http://localhost:8080` (or next available port)

## Step 3: Verify

1. **Backend Health**: Visit `http://localhost:8000/`
   - Should return: `{"status":"ok","service":"ReSight API",...}`

2. **Frontend**: Visit `http://localhost:8080/`
   - Dashboard should load with live data from backend

3. **Test API**: 
   ```bash
   curl http://localhost:8000/metrics
   curl -X POST http://localhost:8000/rank -H "Content-Type: application/json" -d '{"user_id":"U123","items":[]}'
   ```

## Troubleshooting

### Backend won't start
- Check that ML artifacts exist in `azureml/` folder
- Verify Python version: `python --version` (need 3.8+)
- Install dependencies: `pip install -r requirements.txt`

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check `.env` file in `dashboard/` folder: `VITE_API_BASE=http://localhost:8000`
- Check CORS settings in `backend/app.py`

### ML model errors
- Ensure `lightgbm_ranker.pkl` and `encoders.pkl` are valid pickle files
- Check `features.txt` has correct feature names
- Verify feature order matches model expectations

## Next Steps

- Explore the dashboard at `http://localhost:8080`
- Test SHAP explanations: Click on product info icons
- Try What-If simulations: Use calculator icon in analysis blocks
- Test rules: Pin items or boost clearance categories

## Production Deployment

When ready for Azure:
1. Deploy backend to Azure Container Apps or Functions
2. Update `dashboard/.env`: `VITE_API_BASE=https://your-backend.azurewebsites.net`
3. Rebuild frontend: `npm run build`
4. Deploy frontend to Azure Static Web Apps
