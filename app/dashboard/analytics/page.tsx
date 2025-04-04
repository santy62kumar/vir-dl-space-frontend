"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { BarChart, LineChart, PieChart } from "@/components/charts"

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

type TimelineData = {
  month: string
  year: number
  total: number
  completed: number
  cancelled: number
  pending: number
}[]

type UserEngagement = {
  topMessageSenders: {
    _id: string
    name: string
    email: string
    role: string
    messageCount: number
  }[]
  topDocumentUploaders: {
    _id: string
    name: string
    email: string
    role: string
    documentCount: number
  }[]
}

export default function AnalyticsPage() {
  const { user, token } = useAuth()
  // const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [timeline, setTimeline] = useState<TimelineData | null>(null)
  const [engagement, setEngagement] = useState<UserEngagement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch dashboard stats
        const dashboardResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Fetch timeline data
        const timelineResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/deals/timeline`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Fetch user engagement data
        const engagementResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/user-engagement`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          setStats(data.data)
        }

        if (timelineResponse.ok) {
          const data = await timelineResponse.json()
          setTimeline(data.data)
        }

        if (engagementResponse.ok) {
          const data = await engagementResponse.json()
          setEngagement(data.data)
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        toast("Error", {
          description: "Failed to load analytics data",
          // variant: "destructive",
          // title: "Error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (token && user?.role === "admin") {
      fetchAnalyticsData()
    } else {
      setIsLoading(false)
    }
  }, [token, user, toast])

  // Redirect or show access denied if not admin
  if (!isLoading && user?.role !== "admin") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This page is only accessible to administrators. Please contact an administrator if you believe you should
              have access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive analytics and statistics for the Virtual Deal Room.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.userStats.total || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.dealStats.completionRate || 0}%</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Messages Per Deal</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.messageStats.avgPerDeal || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deals" className="w-full">
        <TabsList>
          <TabsTrigger value="deals">Deal Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        <TabsContent value="deals" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Status Distribution</CardTitle>
              <CardDescription>Breakdown of deals by their current status</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : stats ? (
                <PieChart
                  data={[
                    {
                      name: "Pending",
                      value: stats.dealStats.byStatus.pending,
                    },
                    {
                      name: "In Progress",
                      value: stats.dealStats.byStatus["in-progress"],
                    },
                    {
                      name: "Completed",
                      value: stats.dealStats.byStatus.completed,
                    },
                    {
                      name: "Cancelled",
                      value: stats.dealStats.byStatus.cancelled,
                    },
                  ]}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deals Over Time</CardTitle>
              <CardDescription>Monthly trend of deals created, completed, and cancelled</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : timeline && timeline.length > 0 ? (
                <LineChart
                  data={timeline}
                  categories={["total", "completed", "cancelled", "pending"]}
                  index="month"
                  colors={["blue", "green", "red", "orange"]}
                  valueFormatter={(value) => `${value} deals`}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No timeline data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by Role</CardTitle>
              <CardDescription>Breakdown of users by their role in the system</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : stats ? (
                <PieChart
                  data={[
                    {
                      name: "Buyers",
                      value: stats.userStats.byRole.buyer || 0,
                    },
                    {
                      name: "Sellers",
                      value: stats.userStats.byRole.seller || 0,
                    },
                    {
                      name: "Admins",
                      value: stats.userStats.byRole.admin || 0,
                    },
                  ]}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Message Senders</CardTitle>
                <CardDescription>Users with the highest number of messages sent</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : engagement && engagement.topMessageSenders.length > 0 ? (
                  <BarChart
                    data={engagement.topMessageSenders.map((user) => ({
                      name: user.name,
                      value: user.messageCount,
                    }))}
                    index="name"
                    categories={["value"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `${value} messages`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No message data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Document Uploaders</CardTitle>
                <CardDescription>Users who have uploaded the most documents</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : engagement && engagement.topDocumentUploaders.length > 0 ? (
                  <BarChart
                    data={engagement.topDocumentUploaders.map((user) => ({
                      name: user.name,
                      value: user.documentCount,
                    }))}
                    index="name"
                    categories={["value"]}
                    colors={["green"]}
                    valueFormatter={(value) => `${value} documents`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No document data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

