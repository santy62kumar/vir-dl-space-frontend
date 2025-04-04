"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Loader2, MessageSquare, Upload, XCircle } from "lucide-react"
import MessageList from "@/components/deals/message-list"
import DocumentList from "@/components/deals/document-list"

type Deal = {
  _id: string
  title: string
  description: string
  initialPrice: number
  currentPrice: number
  status: "pending" | "in-progress" | "completed" | "cancelled"
  buyer: {
    _id: string
    name: string
    email: string
  }
  seller: {
    _id: string
    name: string
    email: string
  }
  priceHistory: {
    price: number
    proposedBy: {
      _id: string
      name: string
      role: string
    }
    timestamp: string
  }[]
  createdAt: string
  updatedAt: string
}

export default function DealPage() {
  const { id } = useParams<{ id: string }>()
  const { user, token } = useAuth()
  const router = useRouter()
  // const { toast } = useToast()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newPrice, setNewPrice] = useState("")
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDeal(data.deal)

          // Initialize new price with current price
          setNewPrice(data.deal.currentPrice.toString())
        } else {
          toast("Error", {
            description: "Failed to load deal details",
            // variant: "destructive",
            // title: "Error",
          })
          router.push("/dashboard/deals")
        }
      } catch (error) {
        console.error("Error fetching deal:", error)
        toast("Error", {
          description: "An error occurred. Please try again.",
          // variant: "destructive",
          // title: "Error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (token && id) {
      fetchDeal()
    }
  }, [id, token, router, toast])

  const updateDealPrice = async () => {
    if (!newPrice || Number.parseFloat(newPrice) <= 0) {
      toast("Invalid price", {
        description: "Please enter a valid price",
        // variant: "destructive",
        // title: "Invalid price",
      })
      return
    }

    setIsUpdatingPrice(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals/${id}/price`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: Number.parseFloat(newPrice),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setDeal(data.deal)
        toast("Price updated", {
          description: "The deal price has been updated successfully",
          // title: "Price updated",
        })
      } else {
        toast("Error", {
          description: data.message || "Failed to update price",
          // variant: "destructive",
          // title: "Error",
        })
      }
    } catch (error) {
      toast("Error", {
        description: "An error occurred. Please try again.",
        // variant: "destructive",
        // title: "Error",
      })
    } finally {
      setIsUpdatingPrice(false)
    }
  }

  const updateDealStatus = async (status: string) => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setDeal(data.deal)
        toast("Status updated", {
          description: `The deal has been marked as ${status}`,
          // title: "Status updated",
        })
      } else {
        toast("Error", {
          description: data.message || "Failed to update status",
          // variant: "destructive",
          // title: "Error",
        })
      }
    } catch (error) {
      toast("Error", {
        description: "An error occurred. Please try again.",
        // variant: "destructive",
        // title: "Error",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "in-progress":
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/deals")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isLoading ? <Skeleton className="h-8 w-48" /> : deal?.title}
        </h1>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : deal ? (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Deal Details</CardTitle>
                  <Badge
                    variant={
                      deal.status === "completed"
                        ? "default"
                        : deal.status === "in-progress"
                          ? "secondary"
                          : deal.status === "pending"
                            ? "outline"
                            : "destructive"
                    }
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(deal.status)}
                    {deal.status}
                  </Badge>
                </div>
                <CardDescription>Created on {new Date(deal.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-muted-foreground">{deal.description}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="font-medium">Buyer</h3>
                    <p className="text-muted-foreground">{deal.buyer.name}</p>
                    <p className="text-sm text-muted-foreground">{deal.buyer.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Seller</h3>
                    <p className="text-muted-foreground">{deal.seller.name}</p>
                    <p className="text-sm text-muted-foreground">{deal.seller.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Price History</h3>
                  <div className="mt-2 space-y-2">
                    {deal.priceHistory.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md border p-2">
                        <div>
                          <p className="font-medium">${entry.price}</p>
                          <p className="text-sm text-muted-foreground">
                            Proposed by {entry.proposedBy.name} ({entry.proposedBy.role})
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Negotiation */}
                {deal.status !== "completed" && deal.status !== "cancelled" && (
                  <div className="space-y-2">
                    <Label htmlFor="newPrice">Propose New Price</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        disabled={isUpdatingPrice}
                      />
                      <Button onClick={updateDealPrice} disabled={isUpdatingPrice}>
                        {isUpdatingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : "Propose"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Current price: ${deal.currentPrice}</p>
                  </div>
                )}

                <Separator />

                {/* Status Updates */}
                <div className="space-y-2">
                  <h3 className="font-medium">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {deal.status !== "completed" && (
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                        onClick={() => updateDealStatus("completed")}
                        disabled={isUpdatingStatus}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </Button>
                    )}
                    {deal.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => updateDealStatus("cancelled")}
                        disabled={isUpdatingStatus}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Deal
                      </Button>
                    )}
                    {(deal.status === "completed" || deal.status === "cancelled") && (
                      <Button
                        variant="outline"
                        onClick={() => updateDealStatus("in-progress")}
                        disabled={isUpdatingStatus}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Reopen Deal
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="messages" className="w-full">
            <TabsList>
              <TabsTrigger value="messages" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>
            <TabsContent value="messages" className="mt-4">
              <MessageList dealId={id as string} />
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <DocumentList dealId={id as string} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="mb-2 h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Deal not found</h2>
            <p className="text-muted-foreground">
              The deal you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/deals")}>
              Back to Deals
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

