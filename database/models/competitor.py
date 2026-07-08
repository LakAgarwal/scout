import uuid
from sqlalchemy import Column, String, Text, ForeignKey, Integer, UUID
from sqlalchemy.orm import relationship
from database.connection import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(255), unique=True, nullable=False, index=True)
    industry = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)

class CompetitorMention(Base):
    __tablename__ = "competitor_mentions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String(255), nullable=False, index=True)
    mention_count = Column(Integer, default=1, nullable=False)
    context_snippet = Column(Text, nullable=True)

    # Relationships
    article = relationship("Article", back_populates="competitor_mentions")
