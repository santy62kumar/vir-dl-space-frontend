"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import { useSocket } from "@/context/socket-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react"
import { MessageSquare } from "lucide-react"



type Message = {
  _id: string
  deal: string
  sender: {
    _id: string
    name: string
    email: string
  }
  content: string
  readBy?: string[]
  createdAt: string
}

interface MessageListProps {
  dealId: string
}

export default function MessageList({ dealId }: MessageListProps) {
  const { user, token } = useAuth()
  const { socket, isConnected } = useSocket()
  //   const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${dealId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast("Error fetching messages", {
          description: "Failed to load messages",
          //   variant: "destructive",
          //   title: "Error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (token && dealId) {
      fetchMessages()
    }
  }, [dealId, token, toast])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!socket || !isConnected) return

    // Join deal room
    socket.emit("joinDeal", dealId)

    // Listen for new messages
    socket.on("newMessage", (msg: any) => {
      let message: Message = {
        _id: crypto.randomUUID(),
        deal: msg.dealId,
        sender: {
          _id: msg.sender,
          name: msg.senderName,
          email: msg.senderEmail,
        },
        content: msg.content,
        createdAt: msg.timestamp
      };

      setMessages((prev) => [...prev, message])
    })

    // Listen for typing events
    socket.on("userTyping", ({ userId, userName, isTyping }: { userId: string, userName: string, isTyping: string }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(userName)) {
          return [...prev, userName]
        }
        return prev
      })
    })

    socket.on("userStopTyping", ({ userId, userName, isTyping }: { userId: string, userName: string, isTyping: string }) => {
      setTypingUsers((prev) => prev.filter((name) => name !== userName))
    })

    return () => {
      // Leave deal room
      socket.emit("leaveDeal", dealId)
      socket.off("newMessage")
      socket.off("userTyping")
      socket.off("userStopTyping")
    }
  }, [socket, isConnected, dealId])

  const handleTyping = () => {
    if (!socket || !isConnected || !user) return

    socket.emit("typing", { dealId, userName: user.name, isTyping: true })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { dealId, userName: user.name, isTyping: false })
    }, 2000)
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      if (socket && isConnected) {
        socket.emit('sendMessage', {
          dealId,
          content: newMessage,
          senderName: user?.name,
          senderEmail: user?.email,
          createdAt: new Date().toISOString()
        });
      }
    }
    catch (error) {
      console.log("Sending socket message error: ", error);
    }

    setIsSending(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dealId,
          content: newMessage,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // If not using sockets, add message manually
        if (!socket || !isConnected) {
          setMessages((prev) => [...prev, data.message])
        }

        setNewMessage("")

        // Clear typing indicator
        if (socket && isConnected) {
          socket.emit("stopTyping", { dealId, userName: user?.name, isTyping: false })
        }
      } else {
        const data = await response.json()
        toast("Failed to send message", {
          description: data.message || "Failed to send message",
          // variant: "destructive",
          // title: "Error",
        })
      }
    } catch (error) {
      toast("An error occurred", {
        description: "An error occurred. Please try again.",
        //   variant: "destructive",
        //   title: "Error",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <div className="flex max-w-[80%] gap-2">
                    {i % 2 === 0 && <Skeleton className="h-10 w-10 rounded-full" />}
                    <div>
                      <Skeleton className="mb-1 h-4 w-20" />
                      <Skeleton className="h-16 w-[250px] rounded-lg" />
                    </div>
                    {i % 2 !== 0 && <Skeleton className="h-10 w-10 rounded-full" />}
                  </div>
                </div>
              ))}
          </div>
        ) : messages.length > 0 ? (
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
                        className={`rounded-lg p-3 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}
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
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-75"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-150"></div>
                </div>
                <span>
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.length} people are typing...`}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No messages yet</h3>
            <p className="text-muted-foreground">Start the conversation by sending a message.</p>
          </div>
        )}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
              handleTyping()
            }}
            className="min-h-[60px] resize-none"
          />
          <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()} className="self-end">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  )
}

