'use client'

import { useEffect } from 'react'
import { FileText, Download, Trash2, X, File, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAttachments } from '@/hooks/useHybridSearch'

interface AttachmentViewerProps {
  open: boolean
  onClose: () => void
}

export function AttachmentViewer({ open, onClose }: AttachmentViewerProps) {
  const { attachments, loadAttachments, removeAttachment, isLoading, error } = useAttachments()

  useEffect(() => {
    if (open) {
      loadAttachments().catch(error => {
        console.error('Failed to load attachments:', error)
      })
    }
  }, [open, loadAttachments])

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'txt':
      case 'md':
        return <File className="h-5 w-5 text-blue-500" />
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-600" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <Image className="h-5 w-5 text-green-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
    return Math.round(bytes / (1024 * 1024)) + ' MB'
  }

  const handleDelete = async (attachmentId: string, filename: string) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      try {
        await removeAttachment(attachmentId)
      } catch (error) {
        console.error('Failed to delete attachment:', error)
        alert('Failed to delete file. Please try again.')
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-xl shadow-xl max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Uploaded Files</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your uploaded documents and files
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading files...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">Failed to load files</div>
              <Button 
                onClick={() => loadAttachments()}
                variant="outline"
              >
                Try again
              </Button>
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
              <p className="text-gray-500">Upload some files to get started with hybrid search</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {attachments.map((attachment) => (
                <Card key={attachment.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(attachment.filename)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {attachment.filename}
                        </h3>
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.content_length)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(attachment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          // In a real app, this would download the file
                          console.log('Download file:', attachment.filename)
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(attachment.id, attachment.filename)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {attachments.length > 0 && (
          <div className="border-t p-4 bg-gray-50 rounded-b-xl">
            <p className="text-sm text-gray-600 text-center">
              {attachments.length} file{attachments.length !== 1 ? 's' : ''} available for search
            </p>
          </div>
        )}
      </div>
    </div>
  )
}