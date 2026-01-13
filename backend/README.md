# ReSight Backend API

FastAPI backend for ReSight AI Retail Recommender Dashboard.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure ML artifacts are in `../azureml/`:
   - `lightgbm_ranker.pkl`
   - `encoders.pkl`
   - `features.txt`

3. Run the server:
```bash
uvicorn app:app --reload --port 8000
```

Or use the Python module:
```bash
python -m uvicorn app:app --reload --port 8000
```

## API Endpoints

- `POST /rank` - Get ranked product recommendations
- `GET /metrics` - Get KPI metrics for dashboard
- `GET /explain/{itemId}` - Get SHAP feature importance
- `POST /whatif/price` - Simulate price change impact
- `POST /rules/pin` - Pin item to top of recommendations
- `POST /rules/boost-clearance` - Boost clearance items

## Architecture

- **FastAPI** for REST API
- **LightGBM** for ranking inference
- **SHAP** for explainability
- **In-memory** rules engine (ready for database integration)

## Cloud-Ready

The backend is designed to be easily deployable to Azure:
- Environment-based configuration
- Stateless API design
- Can be containerized with Docker
- Compatible with Azure Container Apps or Azure Functions
