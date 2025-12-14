"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase-client-utils"

interface AIChatProps {
  userId: string
  profile: any
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export function AIChat({ userId, profile }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hey ${profile.name}! I'm your FitGrit coach. I'm here to give you the straight truth about your weight loss journey. No sugar-coating, no excuses - just results. What's on your mind today?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Save user message to database (only if Supabase is configured)
      if (isSupabaseConfigured()) {
        await createClient().from("chat_messages").insert({
          user_id: userId,
          role: "user",
          content: userMessage.content,
        })
      }

      // Mock AI response for demo mode
      if (!isSupabaseConfigured()) {
        const mockResponses = [
          "I see you're tracking your progress. That's good, but consistency is what separates winners from wishful thinkers. Are you logging every single day?",
          "Let's be real here - if you're not seeing results, something in your approach needs to change. What excuses have you been making this week?",
          "Progress isn't always linear, but effort should be. Show me you're committed by tracking everything, even the stuff you don't want to admit.",
          "Your goal is achievable, but only if you stop making exceptions for yourself. What's your biggest challenge right now?",
          "I'm here to push you toward success, not comfort you into mediocrity. What action are you going to take today?",
        ]

        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]

        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: randomResponse,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, assistantMessage])
          setLoading(false)
        }, 1500)
        return
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          userId,
          profile,
          history: messages,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save assistant message to database
      await createClient().from("chat_messages").insert({
        user_id: userId,
        role: "assistant",
        content: assistantMessage.content,
      })
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. But here's what I know - consistency beats perfection. Keep logging your progress!",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!isSupabaseConfigured()) return

      const { data } = await createClient()
        .from("chat_messages")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: true })
        .limit(50)

      if (data && data.length > 0) {
        const chatMessages = data.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }))
        setMessages(chatMessages)
      }
    }

    loadChatHistory()
  }, [userId])

  return (
    <Card className="h-[600px] flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          FitGrit Coach
        </CardTitle>
        <CardDescription>Your no-nonsense weight loss coach</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0">
                    {message.role === "user" ? (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`rounded-2xl p-4 max-w-[85%] shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach anything..."
              disabled={loading}
              className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
