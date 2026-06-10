from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models.article import Article
from backend.schemas.article import ArticleOut

router = APIRouter(prefix="/articles", tags=["articles"])

@router.get("/", response_model=List[ArticleOut])
async def get_articles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    articles = db.query(Article).offset(skip).limit(limit).all()
    return articles

@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: UUID, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article
