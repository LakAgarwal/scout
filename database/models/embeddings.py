import uuid
from sqlalchemy import Column, String, ForeignKey, UUID
from sqlalchemy.orm import relationship
from database.connection import Base

class EmbeddingsMetadata(Base):
    __tablename__ = "embeddings_metadata"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), unique=True, nullable=False)
    vector_id = Column(String(255), nullable=False, index=True) # UUID representation of Qdrant point ID

    # Relationships
    article = relationship("Article", back_populates="embeddings_metadata")
