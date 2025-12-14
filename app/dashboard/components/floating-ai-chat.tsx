"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Send, Bot, User, MessageCircle, X, Minimize2, Maximize2, Loader2 } from "lucide-react"

interface FloatingAIChatProps {
  userId: string
  profile: any
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export function FloatingAIChat({ userId, profile }: FloatingAIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hey ${profile?.name || "there"}! 👋 I'm your FitGrit AI coach. Ready to crush some goals today?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Update unread count
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        setUnreadCount((prev) => prev + 1)
      }
    }
  }, [messages, isOpen])

  // Clear unread count when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          userId,
          profile,
          history: messages,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Having trouble connecting. Keep pushing forward! 💪",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsFullscreen(false)
    setIsMinimized(false)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-200 relative"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">FitGrit AI Coach</h3>
            <p className="text-xs opacity-90">Your accountability partner</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/20 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl p-4 shadow-sm ${message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        : "bg-white border border-gray-200"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your coach anything..."
                disabled={loading}
                className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  )

  if (isFullscreen) {
    return (
      <Dialog open={isFullscreen} onOpenChange={(open) => !open && setIsFullscreen(false)}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <ChatContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <Card className={`w-96 shadow-2xl border-0 transition-all duration-200 ${isMinimized ? "h-16" : "h-[600px]"}`}>
        <ChatContent />
      </Card>
    </div>
  )
}
