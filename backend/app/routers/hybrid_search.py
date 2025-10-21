"""
Hybrid Search Router
Provides endpoints for file upload and hybrid search functionality
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
import json
import logging
import os

# Import only what we need at module level
from app.services.db_utils import execute_query, execute_insert
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hybrid-search", tags=["hybrid-search"])


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file and generate embeddings for hybrid search.
    
    Args:
        file: The uploaded file (should be text-based)
        
    Returns:
        JSON response with upload status and file ID
    """
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Read file content
        content_bytes = await file.read()
        
        try:
            # Try to decode as UTF-8
            content = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                # Fallback to latin-1
                content = content_bytes.decode("latin-1")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400, 
                    detail="File content is not readable as text"
                )
        
        if not content.strip():
            raise HTTPException(status_code=400, detail="File content is empty")
        
        # Generate embedding
        try:
            from app.services.embeddings import embed_text
            embedding = embed_text(content)
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to generate embedding: {str(e)}"
            )
        
        # Insert into database
        try:
            query = f"""
                INSERT INTO {settings.db_schema}.attachments (file_name, content, embedding)
                VALUES (%s, %s, %s::vector)
                RETURNING id
            """
            file_id = execute_insert(query, (file.filename, content, json.dumps(embedding)))
            
            if not file_id:
                raise HTTPException(status_code=500, detail="Failed to save file to database")
            
            return JSONResponse(
                content={
                    "message": f"{file.filename} uploaded and embedded successfully",
                    "file_id": file_id,
                    "filename": file.filename,
                    "content_length": len(content)
                },
                status_code=201
            )
            
        except Exception as e:
            logger.error(f"Database insertion failed: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to save to database: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in upload: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/search")
async def search(
    q: str = Query(..., description="Search query"),
    mode: str = Query("hybrid", regex="^(keyword|semantic|hybrid)$", description="Search mode")
):
    """
    Perform hybrid search across uploaded documents.
    
    Args:
        q: Search query string
        mode: Search mode - 'keyword', 'semantic', or 'hybrid'
        
    Returns:
        JSON response with search results
    """
    try:
        if not q.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Generate embedding for semantic/hybrid search
        embedding = None
        if mode in ["semantic", "hybrid"]:
            try:
                from app.services.embeddings import embed_text
                embedding = embed_text(q)
            except Exception as e:
                logger.error(f"Embedding generation failed for query: {e}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to generate query embedding: {str(e)}"
                )
        
        # Execute search based on mode
        try:
            if mode == "keyword":
                query = f"""
                    SELECT id, file_name, content,
                        pgroonga_score(tableoid, ctid) AS keyword_score,
                        0.0 AS semantic_score,
                        pgroonga_score(tableoid, ctid) AS hybrid_score
                    FROM {settings.db_schema}.attachments
                    WHERE content &@~ %s
                    ORDER BY keyword_score DESC
                    LIMIT 10;
                """
                results = execute_query(query, (q,))

            elif mode == "semantic":
                query = f"""
                    SELECT id, file_name, content,
                        0.0 AS keyword_score,
                        1 - (embedding <=> %s::vector) AS semantic_score,
                        1 - (embedding <=> %s::vector) AS hybrid_score
                    FROM {settings.db_schema}.attachments
                    WHERE embedding IS NOT NULL
                    ORDER BY semantic_score DESC
                    LIMIT 10;
                """
                embedding_json = json.dumps(embedding)
                results = execute_query(query, (embedding_json, embedding_json))

            else:  # hybrid
                query = f"""
                    SELECT id, file_name, content,
                        COALESCE(pgroonga_score(tableoid, ctid), 0.0) AS keyword_score,
                        COALESCE(1 - (embedding <=> %s::vector), 0.0) AS semantic_score,
                        (
                            0.5 * COALESCE(pgroonga_score(tableoid, ctid), 0.0)
                            + 0.5 * COALESCE(1 - (embedding <=> %s::vector), 0.0)
                        ) AS hybrid_score
                    FROM {settings.db_schema}.attachments
                    WHERE content &@~ %s OR embedding IS NOT NULL
                    ORDER BY hybrid_score DESC
                    LIMIT 10;
                """
                embedding_json = json.dumps(embedding)
                results = execute_query(query, (embedding_json, embedding_json, q))

            # Format results
            formatted_results = []
            for row in results:
                # Create snippet (first 200 chars)
                snippet = row['content'][:200] + "..." if len(row['content']) > 200 else row['content']
                
                formatted_results.append({
                    "id": str(row['id']),
                    "title": row['file_name'],
                    "snippet": snippet,
                    "scores": {
                        "keyword": float(row['keyword_score']) if row['keyword_score'] else 0.0,
                        "semantic": float(row['semantic_score']) if row['semantic_score'] else 0.0,
                        "hybrid": float(row['hybrid_score']) if row['hybrid_score'] else 0.0
                    },
                    "metadata": {
                        "filename": row['file_name'],
                        "content_length": len(row['content'])
                    }
                })
            
            return JSONResponse(
                content={
                    "query": q,
                    "mode": mode,
                    "results": formatted_results,
                    "total_results": len(formatted_results)
                }
            )
            
        except Exception as e:
            logger.error(f"Search query failed: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Search failed: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in search: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/attachments")
async def list_attachments():
    """
    List all uploaded attachments.
    
    Returns:
        JSON response with list of attachments
    """
    try:
        query = f"""
            SELECT id, file_name, uploaded_at,
                   LENGTH(content) as content_length
            FROM {settings.db_schema}.attachments
            ORDER BY uploaded_at DESC
            LIMIT 100;
        """
        results = execute_query(query)
        
        formatted_results = []
        for row in results:
            formatted_results.append({
                "id": str(row['id']),
                "filename": row['file_name'],
                "uploaded_at": row['uploaded_at'].isoformat() if row['uploaded_at'] else None,
                "content_length": row['content_length']
            })
        
        return JSONResponse(
            content={
                "attachments": formatted_results,
                "total": len(formatted_results)
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to list attachments: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list attachments: {str(e)}")


@router.delete("/attachments/{attachment_id}")
async def delete_attachment(attachment_id: int):
    """
    Delete an attachment by ID.
    
    Args:
        attachment_id: ID of the attachment to delete
        
    Returns:
        JSON response with deletion status
    """
    try:
        query = f"""
            DELETE FROM {settings.db_schema}.attachments
            WHERE id = %s
        """
        rows_affected = execute_query(query, (attachment_id,))
        
        if rows_affected == 0:
            raise HTTPException(status_code=404, detail="Attachment not found")
        
        return JSONResponse(
            content={
                "message": f"Attachment {attachment_id} deleted successfully"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete attachment: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete attachment: {str(e)}")