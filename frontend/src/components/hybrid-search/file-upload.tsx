'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { useFileUpload } from '@/hooks/useHybridSearch'

interface FileUploadProps {
  onUploadSuccess?: (fileId: number, filename: string) => void
  onUploadError?: (error: string) => void
  className?: string
}

export function FileUpload({ onUploadSuccess, onUploadError, className }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { upload, isUploading, uploadError, clearError } = useFileUpload()

  const handleFileSelect = (file: File) => {
    // Validate file type (text-based files)
    const allowedTypes = ['text/plain', 'text/markdown', 'application/json', 'text/csv']
    const allowedExtensions = ['.txt', '.md', '.json', '.csv', '.py', '.js', '.ts', '.html', '.css']
    
    const isValidType = allowedTypes.includes(file.type) || 
                       allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isValidType) {
      const error = 'Please select a text-based file (.txt, .md, .json, .csv, .py, .js, .ts, .html, .css)'
      onUploadError?.(error)
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const error = 'File size must be less than 10MB'
      onUploadError?.(error)
      return
    }

    setSelectedFile(file)
    clearError()
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      const result = await upload(selectedFile)
      onUploadSuccess?.(result.file_id, result.filename)
      setSelectedFile(null)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    clearError()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
    return Math.round(bytes / (1024 * 1024)) + ' MB'
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors select-none
          ${dragOver ? 'border-accent bg-muted' : 'border-border bg-background hover:bg-muted/40'}
          ${selectedFile ? 'border-primary bg-muted/60' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!selectedFile) fileInputRef.current?.click()
        }}
        onKeyDown={(e) => {
          if (!selectedFile && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        role={!selectedFile ? 'button' : undefined}
        tabIndex={!selectedFile ? 0 : -1}
        aria-busy={isUploading}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          accept=".txt,.md,.json,.csv,.py,.js,.ts,.html,.css"
        />

        {!selectedFile ? (
          <>
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Drop a file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports: .txt, .md, .json, .csv, .py, .js, .ts, .html, .css (max 10MB)
            </p>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              variant="outline"
              disabled={isUploading}
            >
              Select File
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-accent" />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                clearSelection()
              }}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="mt-3 p-3 rounded-md flex items-center gap-2 bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive" role="alert">{uploadError}</span>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="min-w-24"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}
    </div>
  )
}