#!/usr/bin/env python3
"""
Simple script to run the FastAPI backend
Uses relative imports - run from backend/ folder or set PYTHONPATH
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
