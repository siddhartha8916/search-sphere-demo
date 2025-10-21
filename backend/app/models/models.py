"""
Database models for hybrid search application.
Only includes the attachments table for document storage and search.
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer
from app.database.connection import Base
from app.config import settings


class Attachment(Base):
    """
    Attachments table for storing uploaded documents with vector embeddings.
    Supports both keyword (PGroonga) and semantic (pgvector) search.
    """
    __tablename__ = "attachments"
    __table_args__ = {"schema": settings.db_schema}
    
    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    # embedding is stored as vector type but we don't define it in SQLAlchemy
    # as we handle it via raw SQL due to pgvector integration
    content_length = Column(Integer, nullable=True)  # computed column in DB
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=True)