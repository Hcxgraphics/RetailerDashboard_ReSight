import requests
import json
import pandas as pd
print("🔥 Retail Chatbot Started 🔥")
print("Type your question after the prompt. Press Ctrl+C to exit.\n")

OLLAMA_URL = "http://localhost:11434/api/generate"

SYSTEM_PROMPT = """
You are a retail analytics assistant.

Response rules:
- Maximum 5 bullet points
- Each bullet: one short sentence
- No introductions
- No conclusions
- No explanations unless asked
- Focus only on actionable insights
- For questions that are out of scope, just one line response

Output format:
- Bullet points only
- Max 5 bullets points
- For questions that are out of bounds, just one line response
- Each bullet under 15 words
"""
def load_data():
    df = pd.read_csv("retail_reco_step1.csv")
    return df

def basic_insights(df):
    total_items = df["item_id"].nunique()

    low_popular = df[df["popularity_bucket"] == "low"]
    avg_price_low = round(low_popular["price"].mean(), 2)

    high_popular = df[df["popularity_bucket"] == "high"]
    avg_price_high = round(high_popular["price"].mean(), 2)

    top_categories = (
        df["main_category"]
        .value_counts()
        .head(3)
        .to_dict()
    )

    return {
        "total_items": total_items,
        "avg_price_low_popularity": avg_price_low,
        "avg_price_high_popularity": avg_price_high,
        "top_categories": top_categories
    }
def apply_filters(df, question):
    q = question.lower()

    # season filter
    if "winter" in q:
        df = df[df["season"].str.lower().isin(["winter", "fall"])]
    elif "summer" in q:
        df = df[df["season"].str.lower() == "summer"]

    # rating filter
    if "low rating" in q or "poor rating" in q:
        df = df[df["rating"] < 3]

    # popularity filter
    if "low popularity" in q or "poor selling" in q:
        df = df[df["popularity_bucket"] == "low"]

    # region filter
    if "us" in q:
        df = df[df["region"].str.lower() == "us"]
    elif "india" in q:
        df = df[df["region"].str.lower() == "india"]

    return df
def pricing_insights(df):
    insights = {}

    # Avg price by popularity
    avg_price_by_popularity = (
        df.groupby("popularity_bucket")["price"]
        .mean()
        .round(2)
        .to_dict()
    )

    # High price + low popularity (overpricing signal)
    overpriced = df[
        (df["price_bucket"] == "high") &
        (df["popularity_bucket"] == "low")
    ]

    overpriced_count = overpriced["item_id"].nunique()

    insights["avg_price_by_popularity"] = avg_price_by_popularity
    insights["overpriced_count"] = overpriced_count

    return insights

def ratings_insights(df):
    insights = {}

    # Low-rated products (individual ratings)
    low_rated = df[df["rating"] < 3]
    low_rated_count = low_rated["item_id"].nunique()

    # Average rating by popularity
    avg_rating_by_popularity = (
        df.groupby("popularity_bucket")["avg_rating"]
        .mean()
        .round(2)
        .to_dict()
    )

    # High-price but low-rating (quality risk)
    quality_risk = df[
        (df["avg_rating"] < 3.5) &
        (df["price_bucket"] == "high")
    ]
    quality_risk_count = quality_risk["item_id"].nunique()

    insights["low_rated_count"] = low_rated_count
    insights["avg_rating_by_popularity"] = avg_rating_by_popularity
    insights["quality_risk_count"] = quality_risk_count

    return insights
def seasonality_insights(df):
    insights = {}

    # Product count by season
    season_distribution = (
        df["season"]
        .fillna("unknown")
        .value_counts()
        .head(4)
        .to_dict()
    )

    # Avg rating by season
    avg_rating_by_season = (
        df.groupby("season")["avg_rating"]
        .mean()
        .round(2)
        .to_dict()
    )

    # Low popularity concentration by season
    low_popularity_by_season = (
        df[df["popularity_bucket"] == "low"]
        .groupby("season")["item_id"]
        .nunique()
        .to_dict()
    )

    insights["season_distribution"] = season_distribution
    insights["avg_rating_by_season"] = avg_rating_by_season
    insights["low_popularity_by_season"] = low_popularity_by_season

    return insights
def is_dashboard_query(question):
    q = question.lower()
    keywords = [
        "dashboard", "summary", "overview",
        "key insights", "business summary",
        "executive", "high level"
    ]
    return any(k in q for k in keywords)

def ask_llm(user_question):
    dashboard_mode = is_dashboard_query(user_question)

    if dashboard_mode:
        dashboard_instructions = """
Dashboard rules:
- Use section headers
- Sections: KPIs, Risks, Opportunities, Recommended Actions
- Each section: max 3 bullet points
- Bullets must be short and metric-driven
"""
    else:
        dashboard_instructions = ""
    
    df = load_data()
    filtered_df = apply_filters(df, user_question)
    if filtered_df.empty:
        return "• No data available for the selected condition"
    insights = basic_insights(filtered_df)
    price_insights = pricing_insights(filtered_df)
    rating_insights = ratings_insights(filtered_df)
    seasonal_insights = seasonality_insights(filtered_df)

    data_context = f"""
Data Summary (from CSV):
- Total unique products: {insights['total_items']}
- Avg price (low popularity): {insights['avg_price_low_popularity']}
- Avg price (high popularity): {insights['avg_price_high_popularity']}
- Top categories: {insights['top_categories']}
"""
    pricing_context = f"""
Pricing Insights:
- Avg price by popularity: {price_insights['avg_price_by_popularity']}
- High-price & low-popularity products: {price_insights['overpriced_count']}
"""
    ratings_context = f"""
Ratings Insights:
- Low-rated products (rating < 3): {rating_insights['low_rated_count']}
- Avg rating by popularity: {rating_insights['avg_rating_by_popularity']}
- High-price & low-rating products: {rating_insights['quality_risk_count']}
"""
    seasonality_context = f"""
Seasonality Insights:
- Product distribution by season: {seasonal_insights['season_distribution']}
- Avg rating by season: {seasonal_insights['avg_rating_by_season']}
- Low popularity items by season: {seasonal_insights['low_popularity_by_season']}
"""
    
    


    prompt = f"""
{SYSTEM_PROMPT}

{data_context}
{pricing_context}
{ratings_context}
{seasonality_context}
User Question: {user_question}
Answer:
"""


    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                 "model": "mistral",
                 "prompt": prompt,
                 "stream": False,
                 "options": {
                 "num_predict": 100
                }
            },
            timeout=180
        )
    except Exception as e:
        return f"Error connecting to Ollama: {e}"

    # Ollama returns newline-separated JSON
    final_answer = ""

    for line in response.text.splitlines():
        if line.strip():
            try:
                data = json.loads(line)
                final_answer += data.get("response", "")
            except json.JSONDecodeError:
                pass

    if not final_answer:
        return "No response from model. Is Ollama running?"

    return final_answer.strip()



while True:
    try:
        user_input = input("Ask retailer bot: ")
        if not user_input.strip():
            print("Please enter a question.\n")
            continue

        answer = ask_llm(user_input)
        print("\n" + answer + "\n")

    except KeyboardInterrupt:
        print("\nExiting chatbot. Goodbye.")
        break
