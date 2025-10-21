'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Search, Upload, FileText, Sparkles, Database, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useSearch } from '@/hooks/useHybridSearch'
import { FileUpload } from './file-upload'
import { AttachmentViewer } from './attachment-viewer'

const searchModes = [
  { id: 'hybrid', label: 'Hybrid', description: 'Combined keyword + semantic', icon: Sparkles },
  { id: 'keyword', label: 'Keyword', description: 'Full-text search', icon: Database },
  { id: 'semantic', label: 'Semantic', description: 'Vector similarity', icon: Zap }
] as const

type SearchMode = typeof searchModes[number]['id']

const exampleQueries = [
  'benefits of unit testing',
  'test coverage vs confidence', 
  'store vectors for similarity search',
  'renewable energy storage methods',
  'improve page performance without blocking render'
]

export function HybridSearchDashboard() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [attachmentsOpen, setAttachmentsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid')
  const [hasSearched, setHasSearched] = useState(false)
  
  // Use real API hooks
  const { search, isSearching, searchError, searchResults } = useSearch()

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    
    try {
      setHasSearched(true)
      await search(searchQuery, searchMode)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }, [searchQuery, searchMode, search])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  const handleExampleQuery = useCallback((query: string) => {
    setSearchQuery(query)
    setHasSearched(true)
    search(query, searchMode).catch(error => {
      console.error('Search failed:', error)
    })
  }, [search, searchMode])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
    return Math.round(bytes / (1024 * 1024)) + ' MB'
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full p-4 border-b border-border">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-2.png"
              alt="SearchSphere Logo"
              width={200}
              height={60}
              priority
              className="h-12 w-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 btn-accent shadow-sm"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
            <Button
              variant="outline"
              onClick={() => setAttachmentsOpen(true)}
              className="flex items-center gap-2 border-border text-foreground hover:bg-muted"
            >
              <FileText className="h-4 w-4" />
              View Files
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl mx-auto text-center space-y-8">
          
          {/* Welcome Message - Always visible */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Welcome to SearchSphere
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover content with intelligent hybrid search - combining full-text keyword matching with semantic vector similarity for more relevant results.
            </p>
          </div>

          {/* Search Mode Selector */}
          <div className="flex justify-center gap-2 flex-wrap">
            {searchModes.map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setSearchMode(mode.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 border",
                    searchMode === mode.id
                      ? "bg-accent text-accent-foreground border-transparent shadow-sm"
                      : "chip hover:bg-muted/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {mode.label}
                </button>
              )
            })}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="flex gap-3 p-2 bg-card rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for anything..."
                className="flex-1 border-0 text-lg px-4 py-3 bg-transparent focus:outline-none focus-visible:ring-0"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                className="rounded-xl px-6 py-3 bg-accent hover:brightness-95 text-accent-foreground disabled:opacity-50"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Example Queries - Hide when searching */}
          {!isSearching && !hasSearched && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <p className="text-sm text-muted-foreground">Try these example searches:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {exampleQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuery(query)}
                    className="px-4 py-2 rounded-full text-sm transition-colors duration-200 border chip hover:bg-muted/60"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="py-12 animate-in fade-in duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-accent"></div>
                  <Search className="h-8 w-8 text-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-muted-foreground animate-pulse">Searching across {searchMode} index...</p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {hasSearched && !isSearching && (
            <div className="w-full">
              {searchError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-center">
                  <p>Search failed: {searchError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-destructive hover:underline text-sm"
                  >
                    Try refreshing the page
                  </button>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Search Results for "{searchQuery}"
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Found {searchResults.length} results using {searchMode} search
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    {searchResults.map((result, index) => (
                      <Card 
                        key={result.id} 
                        className="text-left hover:shadow-md transition-all duration-200 border border-border bg-card animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-foreground mb-2">
                                {result.title}
                              </h3>
                              <p className="text-muted-foreground leading-relaxed mb-3">
                                {result.snippet}
                              </p>
                              
                              {/* Metadata */}
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  {result.metadata.filename}
                                </span>
                                <span>•</span>
                                <span>{formatFileSize(result.metadata.content_length)}</span>
                              </div>
                            </div>
                            
                            {/* Score */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Score:</span>
                              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                {(result.scores.hybrid * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !searchError && (
                <div className="text-center py-12 animate-in fade-in duration-300">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try adjusting your search query or switching search modes</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* File Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setUploadOpen(false)} />
          <div className="relative w-full max-w-md mx-4 bg-card text-foreground border border-border rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload File</h3>
              <Button variant="ghost" size="sm" onClick={() => setUploadOpen(false)}>
                ×
              </Button>
            </div>
            <FileUpload 
              onUploadSuccess={(fileId, filename) => {
                console.log(`File uploaded successfully: ${filename}`)
                setUploadOpen(false)
              }}
              onUploadError={(error) => {
                console.error('Upload failed:', error)
              }}
            />
          </div>
        </div>
      )}

      {/* Attachments Viewer Modal */}
      {attachmentsOpen && (
        <AttachmentViewer 
          open={attachmentsOpen}
          onClose={() => setAttachmentsOpen(false)}
        />
      )}
    </div>
  )
}
