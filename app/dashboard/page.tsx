"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, FileText, MessageSquare, PlusCircle } from "lucide-react"

type DashboardStats = {
  dealStats: {
    total: number
    byStatus: {
      pending: number
      "in-progress": number
      completed: number
      cancelled: number
    }
    completionRate: number
  }
  userStats: {
    total: number
    byRole: {
      buyer: number
      seller: number
      admin: number
    }
  }
  messageStats: {
    total: number
    avgPerDeal: number
  }
  documentStats: {
    total: number
  }
  recentDeals: any[]
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/user-dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data.data)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchDashboardData()
    }
  }, [token])

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}! Here&apos;s an overview of your activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.dealStats.total || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.messageStats.total || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.documentStats.total || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.dealStats.completionRate || 0}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
            <CardDescription>Your most recent deals and their current status.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : stats?.recentDeals && stats.recentDeals.length > 0 ? (
              <div className="space-y-4">
                {stats.recentDeals.map((deal) => (
                  <div key={deal._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <Link href={`/dashboard/deals/${deal._id}`} className="font-medium hover:underline">
                          {deal.title}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {user?.role === "buyer" ? `Seller: ${deal.seller.name}` : `Buyer: ${deal.buyer.name}`}
                          </span>
                          <span>•</span>
                          <span>${deal.currentPrice}</span>
                        </div>
                      </div>
                    </div>
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
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 rounded-full bg-muted p-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">No deals yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  You haven&apos;t created or participated in any deals yet.
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
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Deal Status</CardTitle>
            <CardDescription>Overview of your deals by current status.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[50px]" />
                    </div>
                  ))}
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Pending</span>
                  </div>
                  <span className="font-medium">{stats.dealStats.byStatus.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>In Progress</span>
                  </div>
                  <span className="font-medium">{stats.dealStats.byStatus["in-progress"]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Completed</span>
                  </div>
                  <span className="font-medium">{stats.dealStats.byStatus.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Cancelled</span>
                  </div>
                  <span className="font-medium">{stats.dealStats.byStatus.cancelled}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

