"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { FileText, MessageSquare, Search } from "lucide-react"

type Message = {
  _id: string
  deal: {
    _id: string
    title: string
    status: string
  }
  sender: {
    _id: string
    name: string
    email: string
  }
  content: string
  readBy: string[]
  createdAt: string
}

type Deal = {
  _id: string
  title: string
  status: string
  lastMessage?: {
    content: string
    createdAt: string
    sender: {
      name: string
    }
  }
  unreadCount: number
}

export default function MessagesPage() {
  const { user, token } = useAuth()
//   const { toast } = useToast()
  const [deals, setDeals] = useState<Deal[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)

  useEffect(() => {
    const fetchDealsWithMessages = async () => {
      try {
        // Fetch all deals the user is part of
        const dealsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json()

          // Process each deal to get the last message and unread count
          const dealsWithMessages = await Promise.all(
            dealsData.deals.map(async (deal: any) => {
              try {
                const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${deal._id}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })

                if (messagesResponse.ok) {
                  const messagesData = await messagesResponse.json()
                  const dealMessages = messagesData.messages || []

                  // Get the last message
                  const lastMessage = dealMessages.length > 0 ? dealMessages[dealMessages.length - 1] : null

                  // Count unread messages
                  const unreadCount = dealMessages.filter((msg: any) => !msg.readBy.includes(user?.id)).length

                  return {
                    ...deal,
                    lastMessage: lastMessage
                      ? {
                          content: lastMessage.content,
                          createdAt: lastMessage.createdAt,
                          sender: {
                            name: lastMessage.sender.name,
                          },
                        }
                      : undefined,
                    unreadCount,
                  }
                }
                return deal
              } catch (error) {
                console.error(`Error fetching messages for deal ${deal._id}:`, error)
                return deal
              }
            }),
          )

          // Sort deals by last message date (most recent first)
          const sortedDeals = dealsWithMessages.sort((a, b) => {
            if (!a.lastMessage) return 1
            if (!b.lastMessage) return -1
            return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
          })

          setDeals(sortedDeals)

          // If there are deals, select the first one and load its messages
          if (sortedDeals.length > 0) {
            setSelectedDealId(sortedDeals[0]._id)
            await fetchMessagesForDeal(sortedDeals[0]._id)
          }
        }
      } catch (error) {
        console.error("Error fetching deals with messages:", error)
        toast("Error", {
            description: "Failed to load messages",
            //   variant: "destructive",
            //   title: "Error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchMessagesForDeal = async (dealId: string) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${dealId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error(`Error fetching messages for deal ${dealId}:`, error)
      }
    }

    if (token) {
      fetchDealsWithMessages()
    }
  }, [token, user?.id, toast])

  const handleDealSelect = async (dealId: string) => {
    setSelectedDealId(dealId)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${dealId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])

        // Update the unread count for this deal
        setDeals((prevDeals) => prevDeals.map((deal) => (deal._id === dealId ? { ...deal, unreadCount: 0 } : deal)))
      }
    } catch (error) {
      console.error(`Error fetching messages for deal ${dealId}:`, error)
      toast("Error", {
          description: "Failed to load messages for this deal",
          // variant: "destructive",
          // title: "Error",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const filteredDeals = deals.filter((deal) => deal.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">View and manage all your deal conversations.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search deals..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-1 p-1">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-md p-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : filteredDeals.length > 0 ? (
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredDeals.map((deal) => (
                  <div
                    key={deal._id}
                    className={`flex cursor-pointer items-center gap-3 rounded-md p-3 hover:bg-muted/50 ${
                      selectedDealId === deal._id ? "bg-muted" : ""
                    }`}
                    onClick={() => handleDealSelect(deal._id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{deal.title.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className="truncate font-medium">{deal.title}</h4>
                        {deal.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatMessageDate(deal.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm text-muted-foreground">
                          {deal.lastMessage
                            ? `${deal.lastMessage.sender.name}: ${deal.lastMessage.content}`
                            : "No messages yet"}
                        </p>
                        {deal.unreadCount > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {deal.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No messages yet</h3>
                <p className="text-muted-foreground">You don&apos;t have any deals with messages.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedDealId ? (
            <div className="flex h-full flex-col">
              <CardHeader className="border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{deals.find((d) => d._id === selectedDealId)?.title}</CardTitle>
                    <Badge variant="outline">{deals.find((d) => d._id === selectedDealId)?.status}</Badge>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/deals/${selectedDealId}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Deal
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.sender._id === user?.id
                      return (
                        <div key={message._id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                          <div className="flex max-w-[80%] gap-2">
                            {!isOwnMessage && (
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <p className="mb-1 text-sm text-muted-foreground">
                                {isOwnMessage ? "You" : message.sender.name} •{" "}
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <div
                                className={`rounded-lg p-3 ${
                                  isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                {message.content}
                              </div>
                            </div>
                            {isOwnMessage && (
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No messages yet</h3>
                    <p className="text-muted-foreground">
                      Start the conversation by sending a message in the deal page.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href={`/dashboard/deals/${selectedDealId}`}>Go to Deal Page</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center p-4 text-center">
              <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a deal from the list to view messages.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

