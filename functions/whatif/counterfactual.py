def run_whatif(df, config):
    original = df.copy()
    df.loc[df["item_id"] == config["item_id"], "price"] *= config["price_change"]
    return df["score"] - original["score"]
