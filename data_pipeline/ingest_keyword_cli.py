import sys
import os
import argparse
import json
import logging

# Ensure project root is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.connection import SessionLocal
from database.models.article import Article
from database.models.competitor import CompetitorMention
from data_pipeline.processors import cleaner, classifier
from analytics.sentiment.finbert import analyze_sentiment
from analytics.keyword_extraction.keybert_extractor import extract_keywords
from rag.embedding import embed_and_store
from data_pipeline.scheduler.pipeline_runner import WATCHLIST

def main():
    parser = argparse.ArgumentParser(description="Ingest search query keywords and run Python NLP pipeline")
    parser.add_argument("--q", required=True, type=str, help="Search query")
    args = parser.parse_args()

    # Configure logging to stderr to prevent pollution of JSON output on stdout
    logging.basicConfig(
        level=logging.ERROR,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.StreamHandler(sys.stderr)]
    )
    logger = logging.getLogger(__name__)

    db = SessionLocal()
    q = args.q

    import feedparser
    import requests
    import trafilatura

    query_encoded = requests.utils.quote(q)
    feed_url = f"https://news.google.com/rss/search?q={query_encoded}&hl=en-US&gl=US&ceid=US:en"

    articles_fetched = 0
    new_ingested = 0
    duplicates_skipped = 0
    errors = 0

    ingested_details = []

    try:
        response = requests.get(feed_url, timeout=15)
        response.raise_for_status()
        feed = feedparser.parse(response.content)

        # Ingest top 15 entries
        for entry in feed.entries[:15]:
            articles_fetched += 1
            title = entry.get("title", "")
            url = entry.get("link", "")
            summary = entry.get("summary", "") or entry.get("description") or ""
            source = entry.get("source", {}).get("name") if entry.get("source") else "Google News"
            pub_date_str = entry.get("published", "")

            # 1. Clean HTML from summary
            clean_summary = cleaner.clean_text(summary)
            clean_summary = cleaner.strip_boilerplate(clean_summary)

            # 2. Check for duplicate URL in DB
            existing = db.query(Article).filter(Article.url == url).first()
            if existing:
                duplicates_skipped += 1
                continue

            # 3. Extract full content using trafilatura
            content = clean_summary
            if url:
                try:
                    downloaded = trafilatura.fetch_url(url)
                    if downloaded:
                        extracted = trafilatura.extract(downloaded)
                        if extracted:
                            content = cleaner.clean_text(extracted)
                            content = cleaner.strip_boilerplate(content)
                            content = cleaner.truncate(content)
                except Exception as te:
                    logger.warning(f"Trafilatura failed for {url}: {te}")

            # Normalize pub date
            published_date = cleaner.normalize_date(pub_date_str)

            # 4. Classify industry
            industry, confidence = classifier.classify_industry(content or title)

            try:
                # 5. Insert Article
                db_article = Article(
                    title=title,
                    content=content,
                    summary=clean_summary[:400] + "..." if len(clean_summary) > 400 else clean_summary,
                    source=source,
                    author="Google News RSS Scraper",
                    url=url,
                    industry=industry,
                    published_date=published_date
                )
                db.add(db_article)
                db.commit()
                db.refresh(db_article)

                # 6. Analyze Sentiment
                db_sentiment = analyze_sentiment(db_article, db)
                sentiment_val = db_sentiment.sentiment if db_sentiment else "neutral"

                # 7. Extract Keywords
                db_kws = extract_keywords(db_article, db)
                kws_list = [k.keyword for k in db_kws] if db_kws else []

                # 8. Embed and Store
                embed_and_store(db_article, db)

                # 9. Detect competitor mentions
                mentions = cleaner.detect_mentions(content, WATCHLIST)
                if mentions:
                    for mention in mentions:
                        db_mention = CompetitorMention(
                            article_id=db_article.id,
                            company_name=mention["company_name"],
                            mention_count=mention["mention_count"],
                            context_snippet=mention["context_snippet"]
                        )
                        db.add(db_mention)
                    db.commit()

                new_ingested += 1

                ingested_details.append({
                    "id": str(db_article.id),
                    "title": db_article.title,
                    "url": db_article.url,
                    "source": db_article.source,
                    "industry": db_article.industry,
                    "sentiment": sentiment_val,
                    "keywords": kws_list[:5]
                })

            except Exception as e:
                logger.error(f"Failed to ingest article '{title[:30]}': {e}")
                errors += 1
                db.rollback()

    except Exception as e:
        logger.error(f"Error fetching Google News feed for query '{q}': {e}")
        db.close()
        print(json.dumps({"status": "error", "detail": str(e)}))
        sys.exit(1)

    db.close()

    result = {
        "status": "success",
        "stats": {
            "total_fetched": articles_fetched,
            "new_ingested": new_ingested,
            "duplicates_skipped": duplicates_skipped,
            "errors": errors
        },
        "articles": ingested_details
    }
    # Output to stdout
    print(json.dumps(result))

if __name__ == "__main__":
    main()
