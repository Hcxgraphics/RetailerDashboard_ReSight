def apply_rules(df, rules):
    if rules.get("remove_out_of_stock"):
        df = df[df["inventory"] > 0]

    if rules.get("boost_clearance"):
        df.loc[df["clearance"] == 1, "score"] *= 1.2

    if "pin_item" in rules:
        pinned = df[df["item_id"] == rules["pin_item"]]
        df = df[df["item_id"] != rules["pin_item"]]
        df = pd.concat([pinned, df])

    return df
