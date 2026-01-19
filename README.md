# ReSight – Retailer Insight & Explainable AI Dashboard

> **ReSight** is a Retailer Insight & Explainable Recommendation Dashboard that plugs directly into online stores and transforms raw sales data and AI predictions into decisions retailers can trust and act on. Instead of being a black-box recommender, the platform shows what is being recommended, why it is recommended, and what will happen if changes are made using explainability, real-time performance tracking, and what-if simulations. It solves the trust gap in retail AI by giving merchants transparency, control, and safe experimentation.

## 🎯 Why ReSight Matters

**The Problem:**
- AI recommendations today are black boxes – retailers don't know why products are ranked
- Merchants lose money due to blind optimization without visibility
- No way to safely test changes before deploying them

**The Solution:**
ReSight adds **trust**, **control**, and **visibility** to retail AI by:
- 🔍 **Explainable AI**: SHAP values show exactly why each product ranks where it does
- 🎮 **What-If Simulator**: Test price changes, stock adjustments, and promotions before deploying
- 🎛️ **Manual Overrides**: Pin, boost, or demote products with full audit trails
- 📊 **Real-Time KPIs**: Live dashboard updates via WebSocket showing revenue, views, clicks, and conversions
- 🔄 **Mock + Live Modes**: Works with simulated data or real marketplace webhooks

## 🏗️ Architecture

```
Marketplaces (Amazon, Myntra, Meesho)
         ↓
    Webhooks API
         ↓
   Retail Data Store (PostgreSQL / SQLite)
         ↓
  LightGBM ML Engine
         ↓
  FastAPI Backend
         ↓
  React Dashboard (Real-Time)
```

## ✨ Features

- **Real-Time KPIs**: Revenue, views, clicks, active products, average order value
- **Explainable AI (SHAP)**: Feature importance for every recommendation
- **What-If Simulator**: Simulate price changes and see rank impact instantly
- **Manual Controls**: Pin items, boost clearance, demote products
- **Bias Detection**: Group-level performance analysis
- **Mock + Live Modes**: Demo mode with simulated data or connect real marketplaces
- **WebSocket Updates**: Live dashboard updates without page refresh
- **Audit Logging**: Complete history of all actions and changes

## 🛠️ Tech Stack

- **Backend**: FastAPI, Python 3.11+
- **ML**: LightGBM Ranker, SHAP Explainability
- **Database**: PostgreSQL (production) / SQLite (development)
- **Frontend**: React + TypeScript + Vite
- **Real-Time**: WebSockets
- **Deployment**: Render, Railway, Vercel-ready

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (optional, SQLite works for local dev)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/RetailerDashboard_ReSight.git
cd RetailerDashboard_ReSight
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your settings

# Initialize database
python init_db.py

# Start server
python -m uvicorn app:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd dashboard

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your backend URL

# Start dev server
npm run dev
```

### 4. Verify Setup

- **Backend**: http://localhost:8000/ (health check)
- **Frontend**: http://localhost:8080/ (dashboard)

## 📡 Simulating Marketplace Webhooks

ReSight works in **Mock Mode** by default, generating simulated events every 5 seconds. To simulate real marketplace webhooks:

### Amazon Webhook Example

```bash
curl -X POST http://localhost:8000/integrations/amazon/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ORDER_PLACED",
    "asin": "SKU123",
    "price": 999.0,
    "quantity": 1,
    "region": "IN"
  }'
```

**What Happens:**
1. Stock is reduced
2. Purchase event is recorded
3. Rankings are recalculated instantly
4. Dashboard updates via WebSocket
5. Audit log is created

### Myntra / Meesho Webhooks

```bash
# Myntra
curl -X POST http://localhost:8000/integrations/myntra/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "MYN-001",
    "title": "Product Name",
    "category": "Apparel",
    "price": 499.0,
    "stock": 100,
    "views": 1000,
    "clicks": 50,
    "orders": 5
  }'

# Meesho
curl -X POST http://localhost:8000/integrations/meesho/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "MEE-001",
    "title": "Product Name",
    "category": "Apparel",
    "price": 299.0,
    "stock": 200,
    "views": 500,
    "clicks": 25,
    "orders": 3
  }'
```

## 📚 API Endpoints

### Core Endpoints

- `GET /` - Health check
- `GET /metrics` - KPI metrics (revenue, views, clicks, etc.)
- `POST /rank` - Get ranked product recommendations
- `GET /item/{item_id}` - Get product details with ML score
- `GET /explain/{item_id}` - Get SHAP feature importance

### What-If & Rules

- `POST /whatif/price` - Simulate price change impact
- `POST /rules/pin` - Pin item to top
- `POST /rules/boost-clearance` - Boost clearance category

### Marketplace Webhooks

- `POST /integrations/amazon/webhook` - Amazon events
- `POST /integrations/myntra/webhook` - Myntra events
- `POST /integrations/meesho/webhook` - Meesho events

### Real-Time

- `WS /ws` - WebSocket for live KPI updates

## 🌐 Deployment

### Render.com

1. Connect your GitHub repository
2. Create new Web Service
3. Use `render.yaml` configuration
4. Set environment variables:
   - `DATABASE_URL` (PostgreSQL)
   - `API_ALLOWED_ORIGINS` (your frontend URL)
   - `API_SECRET_KEY` (generate secure key)

### Railway.app

1. Connect GitHub repository
2. Railway auto-detects `railway.json`
3. Add PostgreSQL database
4. Set environment variables

### Frontend (Vercel / Netlify)

1. Connect repository
2. Set build command: `cd dashboard && npm run build`
3. Set output directory: `dashboard/dist`
4. Add environment variable: `VITE_API_BASE=https://your-backend-url.com`

## 🔒 Security

- ✅ All secrets moved to `.env` files
- ✅ `.env` files in `.gitignore`
- ✅ Demo credentials configurable via environment variables
- ✅ CORS origins configurable
- ✅ Webhook authentication ready (add secrets in `.env`)

## 📁 Project Structure

```
resight/
├── backend/              # FastAPI backend
│   ├── app.py           # Main API server
│   ├── database.py       # SQLAlchemy models
│   ├── retail_data_api.py # Data access layer
│   ├── mock_generator.py # Mock event generator
│   ├── init_db.py        # Database initialization
│   └── requirements.txt  # Python dependencies
├── dashboard/           # React frontend
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── components/  # React components
│   │   └── pages/       # Page components
│   └── package.json
├── azureml/            # ML artifacts
│   ├── lightgbm_ranker.pkl
│   ├── encoders.pkl
│   └── features.txt
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
├── Procfile            # Heroku deployment
├── render.yaml         # Render.com config
├── railway.json        # Railway.app config
└── README.md           # This file
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request


## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- ML powered by [LightGBM](https://lightgbm.readthedocs.io/)
- Explainability via [SHAP](https://shap.readthedocs.io/)
- UI with [React](https://react.dev/) + [shadcn/ui](https://ui.shadcn.com/)

---

**Made with ❤️ for retailers who want to understand their AI**