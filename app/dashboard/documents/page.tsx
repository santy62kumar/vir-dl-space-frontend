"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Download, File, FileText, Loader2, MoreVertical, Search, Trash } from "lucide-react"

type Document = {
  _id: string
  deal: {
    _id: string
    title: string
    status: string
  }
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

export default function DocumentsPage() {
  const { user, token } = useAuth()
//   const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchAllDocuments = async () => {
      try {
        // First, fetch all deals the user is part of
        const dealsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json()

          // For each deal, fetch its documents
          const allDocumentsPromises = dealsData.deals.map(async (deal: any) => {
            try {
              const documentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${deal._id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })

              if (documentsResponse.ok) {
                const documentsData = await documentsResponse.json()
                // Add deal info to each document
                return documentsData.documents.map((doc: any) => ({
                  ...doc,
                  deal: {
                    _id: deal._id,
                    title: deal.title,
                    status: deal.status,
                  },
                }))
              }
              return []
            } catch (error) {
              console.error(`Error fetching documents for deal ${deal._id}:`, error)
              return []
            }
          })

          const documentsArrays = await Promise.all(allDocumentsPromises)
          // Flatten the array of arrays into a single array of documents
          const allDocuments = documentsArrays.flat()

          // Sort documents by creation date (newest first)
          const sortedDocuments = allDocuments.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )

          setDocuments(sortedDocuments)
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
        toast("Error", {
            description: "Failed to load documents",
            //   variant: "destructive",
            //   title: "Error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchAllDocuments()
    }
  }, [token, toast])

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

  // Filter documents based on search query and active tab
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.deal.title.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "uploaded") return matchesSearch && doc.uploadedBy._id === user?.id
    if (activeTab === "shared") return matchesSearch && doc.uploadedBy._id !== user?.id

    return matchesSearch
  })

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">View and manage all your deal documents.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="uploaded">Uploaded by Me</TabsTrigger>
              <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-6">
                {Array(5)
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
            ) : filteredDocuments.length > 0 ? (
              <div className="divide-y">
                {filteredDocuments.map((doc) => (
                  <div key={doc._id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                    {getFileIcon(doc.fileType)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{doc.fileName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href={`/dashboard/deals/${doc.deal._id}`} className="hover:underline truncate">
                          {doc.deal.title}
                        </Link>
                        <span>•</span>
                        <Badge variant="outline">{doc.deal.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>
                          {doc.uploadedBy._id === user?.id ? "Uploaded by you" : `Uploaded by ${doc.uploadedBy.name}`}
                        </span>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/deals/${doc.deal._id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Deal
                          </Link>
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No documents found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No documents match your search criteria."
                    : activeTab === "uploaded"
                      ? "You haven't uploaded any documents yet."
                      : activeTab === "shared"
                        ? "No documents have been shared with you."
                        : "There are no documents available."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}

