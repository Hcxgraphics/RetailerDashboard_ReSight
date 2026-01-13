import requests
import pandas as pd
import json
from rules.rules_engine import apply_rules
from whatif.counterfactual import run_whatif

AZURE_ML_ENDPOINT = "https://retail-ranker.eastus.inference.ml.azure.com/score"
AZURE_ML_KEY = "YOUR_KEY"

def main(req):
    payload = req.get_json()

    # 1. Call Azure ML
    response = requests.post(
        AZURE_ML_ENDPOINT,
        headers={
            "Authorization": f"Bearer {AZURE_ML_KEY}",
            "Content-Type": "application/json"
        },
        json=payload
    )

    results = response.json()
    df = pd.DataFrame(results["recommendations"])

    # 2. Apply rules
    rules = payload.get("rules", {})
    df = apply_rules(df, rules)

    # 3. Optional what-if
    if payload.get("what_if"):
        df["what_if_delta"] = run_whatif(df, payload["what_if"])

    return {
        "status": 200,
        "body": df.to_dict(orient="records")
    }
