#!/bin/bash
# ReSight Backend Server - Run Script
# Uses virtualenv Python explicitly

PYTHON="../.venv/bin/python"
APP="app:app"

if [ ! -f "$PYTHON" ]; then
    echo "Error: Python not found at $PYTHON"
    echo "Please create virtualenv first:"
    echo "  python -m venv .venv"
    echo "  .venv/bin/pip install -r requirements.txt"
    exit 1
fi

echo "Starting ReSight API server..."
echo "Python: $PYTHON"
echo "App: $APP"
echo ""

$PYTHON -m uvicorn $APP --reload --port 8000 --host 0.0.0.0
