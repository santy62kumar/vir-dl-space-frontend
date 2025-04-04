"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, File, FileText, Loader2, MoreVertical, Trash, Upload } from "lucide-react"

type Document = {
  _id: string
  deal: string
  uploadedBy: {
    _id: string
    name: string
    email: string
  }
  fileName: string
  fileType: string
  fileSize: number
  accessibleTo: string[]
  createdAt: string
}

interface DocumentListProps {
  dealId: string
}

export default function DocumentList({ dealId }: DocumentListProps) {
  const { user, token } = useAuth()
//   const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${dealId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDocuments(data.documents)
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
        toast("Failed to load documents", {
            description: "Failed to load documents",
            // variant: "destructive",
            // title: "Error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (token && dealId) {
      fetchDocuments()
    }
  }, [dealId, token, toast])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("document", file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${dealId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments((prev) => [...prev, data.document])
        toast("Document uploaded", {
            description: "Your document has been uploaded successfully",
            //   title: "Document uploaded",
        })
      } else {
        const data = await response.json()
        toast("Upload failed", {
            description: data.message || "Failed to upload document",
            //   variant: "destructive",
            //   title: "Upload failed",
        })
      }
    } catch (error) {
      toast("Upload failed", {
          description: "An error occurred during upload",
          // variant: "destructive",
          // title: "Upload failed",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const downloadDocument = async (documentId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Get filename from Content-Disposition header if available
        const contentDisposition = response.headers.get("Content-Disposition")
        let filename = "document"

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      } else {
        const data = await response.json()
        toast("Download failed", {
            description: data.message || "Failed to download document",
            //   variant: "destructive",
            //   title: "Download failed",
        })
      }
    } catch (error) {
      toast("Download failed", {
          description: "An error occurred during download",
          // variant: "destructive",
          // title: "Download failed",
      })
    }
  }

  const deleteDocument = async () => {
    if (!selectedDocument) return

    setIsDeleting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${selectedDocument._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc._id !== selectedDocument._id))
        toast("Document deleted", {
            description: "The document has been deleted successfully",
            //   title: "Document deleted",
        })
      } else {
        const data = await response.json()
        toast("Delete failed", {
            description: data.message || "Failed to delete document",
            //   variant: "destructive",
            //   title: "Delete failed",
        })
      }
    } catch (error) {
      toast("Delete failed", {
          description: "An error occurred while deleting the document",
          // variant: "destructive",
          // title: "Delete failed",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setSelectedDocument(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />
    } else if (fileType.includes("image")) {
      return <File className="h-6 w-6 text-blue-500" />
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return <FileText className="h-6 w-6 text-blue-700" />
    } else {
      return <File className="h-6 w-6 text-muted-foreground" />
    }
  }

  return (
    <>
      <Card className="flex h-[600px] flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Documents</h3>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-md border p-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc._id} className="flex items-center gap-4 rounded-md border p-4 hover:bg-muted/50">
                  {getFileIcon(doc.fileType)}
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.fileName}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Uploaded by {doc.uploadedBy.name === user?.name ? "you" : doc.uploadedBy.name}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadDocument(doc._id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      {doc.uploadedBy._id === user?.id && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDocument(doc)
                            setShowDeleteDialog(true)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No documents yet</h3>
              <p className="text-muted-foreground">Upload documents to share with the other party.</p>
              <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedDocument?.fileName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteDocument} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

