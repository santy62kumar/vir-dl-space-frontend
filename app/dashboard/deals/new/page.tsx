"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type Seller = {
  _id: string
  name: string
  email: string
}

export default function NewDealPage() {
  const { token } = useAuth()
  const router = useRouter()
  // const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [initialPrice, setInitialPrice] = useState("")
  const [sellerId, setSellerId] = useState("")
  const [sellers, setSellers] = useState<Seller[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingSellers, setIsFetchingSellers] = useState(true)

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals/sellers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSellers(data.sellers);
        } else {
          throw new Error('Failed to fetch sellers');
        }
      } catch (error) {
        console.error("Error fetching sellers:", error)
        toast("Error", {
          description: "Failed to load sellers. Please try again.",
          // variant: "destructive",
          // title: "Error",
        })
      } finally {
        setIsFetchingSellers(false)
      }
    }

    if (token) {
      fetchSellers()
    }
  }, [token, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          initialPrice: Number.parseFloat(initialPrice),
          sellerId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast("Deal created", {
          description: "Your deal has been created successfully.",
          // title: "Deal created",
        })
        router.push(`/dashboard/deals/${data.deal._id}`)
      } else {
        toast("Error", {
          description: data.message || "Failed to create deal",
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
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create a New Deal</CardTitle>
          <CardDescription>Fill in the details to create a new business deal.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title</Label>
              <Input
                id="title"
                placeholder="Enter deal title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the deal details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialPrice">Initial Price ($)</Label>
              <Input
                id="initialPrice"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller">Select Seller</Label>
              <Select value={sellerId} onValueChange={setSellerId} disabled={isFetchingSellers} required>
                <SelectTrigger id="seller">
                  <SelectValue placeholder="Select a seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller._id} value={seller._id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFetchingSellers && <p className="text-sm text-muted-foreground">Loading sellers...</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Deal"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

