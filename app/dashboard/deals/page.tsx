"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FileText, PlusCircle, Search } from "lucide-react"

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
  createdAt: string
  updatedAt: string
}

export default function DealsPage() {
  const { user, token } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/deals`

        if (statusFilter !== "all") {
          url += `?status=${statusFilter}`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDeals(data.deals)
        }
      } catch (error) {
        console.error("Error fetching deals:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchDeals()
    }
  }, [token, statusFilter])

  const filteredDeals = deals.filter((deal) => deal.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Manage and track all your business deals.</p>
        </div>
        {user?.role === "buyer" && (
          <Button asChild>
            <Link href="/dashboard/deals/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Deal
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search deals..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </Card>
            ))}
        </div>
      ) : filteredDeals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal) => (
            <Link key={deal._id} href={`/dashboard/deals/${deal._id}`}>
              <Card className="h-full p-6 transition-all hover:border-primary hover:shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{deal.title}</h3>
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
                    >
                      {deal.status}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{deal.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {user?.role === "buyer" ? `Seller: ${deal.seller.name}` : `Buyer: ${deal.buyer.name}`}
                    </div>
                    <div className="font-medium">${deal.currentPrice}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No deals found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {searchQuery
              ? "No deals match your search criteria."
              : user?.role === "buyer"
                ? "You haven't created any deals yet."
                : "You don't have any deals assigned to you."}
          </p>
          {user?.role === "buyer" && (
            <Button asChild>
              <Link href="/dashboard/deals/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create a Deal
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

