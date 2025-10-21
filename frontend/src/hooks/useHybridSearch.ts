/**
 * Hooks for Hybrid Search functionality
 */

import { useState, useCallback } from 'react'
import { 
  uploadFile, 
  searchDocuments, 
  getAttachments, 
  deleteAttachment,
  type ApiSearchResult,
  type ApiAttachment,
  type SearchResponse 
} from '@/lib/api'

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const upload = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadError(null)
    
    try {
      const result = await uploadFile(file)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [])

  return {
    upload,
    isUploading,
    uploadError,
    clearError: () => setUploadError(null)
  }
}

export function useSearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<ApiSearchResult[]>([])
  const [lastQuery, setLastQuery] = useState<string>('')
  const [lastMode, setLastMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid')

  const search = useCallback(async (
    query: string, 
    mode: 'keyword' | 'semantic' | 'hybrid' = 'hybrid'
  ) => {
    if (!query.trim()) {
      setSearchResults([])
      return { results: [], total_results: 0, query: '', mode }
    }

    setIsSearching(true)
    setSearchError(null)
    setLastQuery(query)
    setLastMode(mode)
    
    try {
      const result = await searchDocuments(query, mode)
      setSearchResults(result.results)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed'
      setSearchError(errorMessage)
      setSearchResults([])
      throw error
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setLastQuery('')
    setSearchError(null)
  }, [])

  return {
    search,
    clearSearch,
    isSearching,
    searchError,
    searchResults,
    lastQuery,
    lastMode,
    clearError: () => setSearchError(null)
  }
}

export function useAttachments() {
  const [attachments, setAttachments] = useState<ApiAttachment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAttachments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getAttachments()
      setAttachments(result.attachments)
      return result.attachments
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load attachments'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeAttachment = useCallback(async (attachmentId: string) => {
    try {
      await deleteAttachment(attachmentId)
      setAttachments(prev => prev.filter(att => att.id !== attachmentId))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete attachment'
      setError(errorMessage)
      throw error
    }
  }, [])

  const addAttachment = useCallback((newAttachment: ApiAttachment) => {
    setAttachments(prev => [newAttachment, ...prev])
  }, [])

  return {
    attachments,
    loadAttachments,
    removeAttachment,
    addAttachment,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}