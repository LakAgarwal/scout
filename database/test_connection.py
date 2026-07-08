import sys
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from database.connection import SessionLocal, engine, Base
from database.models.article import Article

def test_db_connection():
    print("[Test DB] Connecting to database...")
    try:
        # Create tables if they do not exist
        print("[Test DB] Creating tables (Base.metadata.create_all)...")
        Base.metadata.create_all(bind=engine)
        
        db: Session = SessionLocal()
        print("[Test DB] Session created successfully.")
        
        # Insert a dummy Article row
        dummy_url = f"https://example.com/test-article-{uuid.uuid4()}"
        dummy_article = Article(
            id=uuid.uuid4(),
            title="Scout Test Connection Article Title",
            content="This is a test article to verify database insertion and querying.",
            summary="Test summary",
            source="Test Source",
            author="Test Author",
            url=dummy_url,
            industry="defense",
            published_date=datetime.utcnow()
        )
        
        print(f"[Test DB] Inserting dummy article with URL: {dummy_url}")
        db.add(dummy_article)
        db.commit()
        db.refresh(dummy_article)
        
        # Query it back
        print("[Test DB] Querying dummy article back...")
        retrieved = db.query(Article).filter(Article.url == dummy_url).first()
        if not retrieved:
            raise Exception("Inserted article was not found in database!")
            
        print(f"[Test DB] Successfully retrieved article! Title: '{retrieved.title}'")
        
        # Clean up
        print("[Test DB] Deleting dummy article...")
        db.delete(retrieved)
        db.commit()
        
        db.close()
        print("[Test DB] Database connection test PASSED.")
        return True
    except Exception as e:
        print(f"[Test DB] Database connection test FAILED: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    success = test_db_connection()
    sys.exit(0 if success else 1)
