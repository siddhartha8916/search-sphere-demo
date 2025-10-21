"""
Database connection utilities for direct database access
Used for hybrid search operations that require raw SQL
"""

import psycopg2
import psycopg2.extras
from app.config import settings
from typing import Any, Dict, Optional, Union, Tuple


def get_db_connection():
    """
    Get a direct psycopg2 connection for raw SQL operations.
    This is used for hybrid search queries that need PGroonga and pgvector.
    
    Returns:
        psycopg2 connection object
    """
    # Parse the DATABASE_URL to get connection parameters
    db_url = settings.database_url
    
    # Handle different URL formats
    if db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        raise Exception(f"Failed to connect to database: {str(e)}")


def execute_query(query: str, params: Optional[Tuple] = None, fetch_all: bool = True) -> Any:
    """
    Execute a query and return results.
    
    Args:
        query: SQL query string
        params: Query parameters
        fetch_all: Whether to fetch all results (True) or just one (False)
        
    Returns:
        Query results as list of dicts or single dict
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, params)
            
            if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
                conn.commit()
                return cur.rowcount
            
            if fetch_all:
                return cur.fetchall()
            else:
                return cur.fetchone()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def execute_insert(query: str, params: Optional[Tuple] = None) -> Optional[int]:
    """
    Execute an INSERT query and return the ID of the inserted row.
    
    Args:
        query: SQL INSERT query string
        params: Query parameters
        
    Returns:
        ID of the inserted row
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            # Get the ID of the inserted row
            if "RETURNING" in query.upper():
                result = cur.fetchone()
                conn.commit()
                return result[0] if result else None
            else:
                conn.commit()
                return cur.lastrowid
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()