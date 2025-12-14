"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, Brain, Loader2, Bot, User } from "lucide-react"

interface AICoachProps {
  userId: string
  profile: any
  onClose: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  quickReplies?: string[]
}

export function AICoach({ userId, profile, onClose }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hey ${profile.name || "there"}! 👋 I'm your FitGrit AI Coach. I've been analyzing your progress${profile.starting_weight && profile.current_weight ? ` - you've lost ${(profile.starting_weight - profile.current_weight).toFixed(1)}kg so far, which is fantastic!` : "."} 

I'm here to give you honest, actionable advice. No sugarcoating, just results. What's on your mind today?`,
      timestamp: new Date(),
      quickReplies: ["Analyze my progress", "Meal suggestions", "Workout tips", "Motivation boost"],
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Call the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
        quickReplies: data.quickReplies || [],
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Fallback response
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm having some technical difficulties right now. Let me give you some general advice: consistency is key in your fitness journey. Keep logging your meals, stay active, and don't get discouraged by temporary plateaus. Your progress takes time!",
        timestamp: new Date(),
        quickReplies: ["Tell me about my progress", "Meal suggestions", "Workout tips", "Motivation boost"],
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickActions = [
    { label: "Analyze my progress", icon: "📊" },
    { label: "Why am I plateauing?", icon: "🤔" },
    { label: "Meal suggestions", icon: "🍽️" },
    { label: "Workout recommendations", icon: "💪" },
    { label: "Motivation boost", icon: "🔥" },
    { label: "Weekly summary", icon: "📈" },
  ]

  const handleQuickAction = (action: string) => {
    setInputMessage(action)
  }

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply)
    // Auto-send the quick reply
    setTimeout(() => {
      const event = new Event("submit") as any
      handleSendMessage({ preventDefault: () => {}, ...event })
    }, 100)
  }

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white shadow-xl hover:bg-blue-700"
      >
        <Bot className="h-4 w-4" />
        <span className="text-sm font-semibold">Open AI Coach</span>
      </button>
    )
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <Card className="w-full max-w-3xl h-[85vh] bg-white shadow-2xl border border-gray-200 flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                FitGrit AI Coach
              </CardTitle>
              <CardDescription className="text-blue-100">Your personal AI fitness advisor</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="text-white hover:bg-white/20"
              >
                Minimize
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className="flex-shrink-0">
                        {message.role === "user" ? (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div
                        className={`rounded-2xl p-4 shadow-sm ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Replies */}
                  {message.role === "assistant" && message.quickReplies && message.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-12">
                      {message.quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs h-8 px-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                          disabled={isLoading}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">AI Coach is analyzing your data...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions and Input - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.label)}
                    className="text-xs"
                    disabled={isLoading}
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your AI coach anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
