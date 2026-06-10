import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, Integer, DateTime, UUID
from sqlalchemy.orm import relationship
from database.connection import Base

class SentimentScore(Base):
    __tablename__ = "sentiment_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), unique=True, nullable=False)
    sentiment = Column(String(50), nullable=False) # positive, negative, neutral
    score = Column(Float, nullable=False)          # confidence score

    # Relationships
    article = relationship("Article", back_populates="sentiment_score")

class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False)
    keyword = Column(String(255), nullable=False, index=True)
    score = Column(Float, nullable=False)

    # Relationships
    article = relationship("Article", back_populates="keywords")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_name = Column(String(255), unique=True, nullable=False, index=True)
    frequency = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
