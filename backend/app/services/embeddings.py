"""
OpenAI Embeddings Service
Provides text embedding functionality using OpenAI's text-embedding-3-small model
"""

from openai import OpenAI
import os
from typing import List
from app.config import settings


class EmbeddingsService:
    def __init__(self):
        self._client = None
        self.model = "text-embedding-3-small"
        self.embedding_dimension = 1536
    
    @property
    def client(self):
        """Lazy initialization of OpenAI client"""
        if self._client is None:
            # Try to get API key from settings first, then environment
            api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            
            if not api_key or api_key in ["", "your-openai-api-key-here"]:
                raise ValueError(
                    "OpenAI API key not set. Please set OPENAI_API_KEY environment variable "
                    "or update your .env file with a valid OpenAI API key."
                )
            self._client = OpenAI(api_key=api_key)
        return self._client

    def embed_text(self, text: str) -> List[float]:
        """
        Generate embeddings for a single text string.
        
        Args:
            text: The text to embed
            
        Returns:
            List of floats representing the embedding vector
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text.strip()
            )
            return response.data[0].embedding
        except Exception as e:
            raise Exception(f"Failed to generate embedding: {str(e)}")

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple text strings.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        if not texts:
            return []
        
        # Filter out empty texts
        valid_texts = [text.strip() for text in texts if text and text.strip()]
        
        if not valid_texts:
            raise ValueError("No valid texts provided")
        
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=valid_texts
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            raise Exception(f"Failed to generate embeddings: {str(e)}")


# Create a global instance
embeddings_service = EmbeddingsService()


def embed_text(text: str) -> List[float]:
    """
    Convenience function to embed a single text.
    """
    return embeddings_service.embed_text(text)


def embed_texts(texts: List[str]) -> List[List[float]]:
    """
    Convenience function to embed multiple texts.
    """
    return embeddings_service.embed_texts(texts)