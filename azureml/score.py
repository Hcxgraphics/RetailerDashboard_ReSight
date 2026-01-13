import json
import joblib
import numpy as np
import pandas as pd

def init():
    """
    Runs ONCE when endpoint starts
    """
    global model, encoders, FEATURES
    
    model = joblib.load("lightgbm_ranker.pkl")
    encoders = joblib.load("encoders.pkl")

    with open("features.txt") as f:
        FEATURES = f.read().splitlines()


def run(raw_data):
    """
    Runs for EVERY API CALL
    """
    data = json.loads(raw_data)

    df = pd.DataFrame(data["items"])

    # Encode categorical features
    for col, encoder in encoders.items():
        if col in df:
            df[col] = encoder.transform(df[col].astype(str))

    # Ensure feature order
    X = df[FEATURES]

    scores = model.predict(X)

    df["score"] = scores

    # Sort by score
    df = df.sort_values("score", ascending=False)

    return {
        "user_id": data["user_id"],
        "recommendations": df[["item_id", "score"]].to_dict(orient="records")
    }
