"""
Pydantic schemas for hybrid search application API.
Only includes schemas for attachment/document management.
"""
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


# Attachment Schemas
class AttachmentBase(BaseModel):
    """Base schema for attachment data"""
    file_name: str = Field(..., min_length=1, max_length=500, description="Name of the uploaded file")
    content: str = Field(..., min_length=1, description="Text content of the file")


class AttachmentCreate(AttachmentBase):
    """Schema for creating a new attachment"""
    pass


class AttachmentResponse(BaseModel):
    """Schema for attachment API responses"""
    id: int
    file_name: str
    content_length: Optional[int] = None
    uploaded_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AttachmentDetail(AttachmentResponse):
    """Detailed attachment response including full content"""
    content: str


# Search Schemas
class SearchResult(BaseModel):
    """Schema for individual search result"""
    id: int
    title: str  # file_name
    snippet: str  # truncated content
    metadata: dict  # includes filename, content_length, uploaded_at
    scores: dict  # keyword_score, semantic_score, hybrid_score


class SearchResponse(BaseModel):
    """Schema for search API response"""
    query: str
    mode: str  # keyword, semantic, or hybrid
    results: list[SearchResult]
    count: int
    author_id: UUID
    is_published: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True