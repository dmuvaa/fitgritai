"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Send, 
  Bot, 
  User, 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap
} from "lucide-react"

interface AgenticAIChatProps {
  userId: string
  profile: any
}

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  action?: {
    type: string
    requiresConfirmation: boolean
  }
  actionResult?: {
    success: boolean
    message: string
  }
  actionError?: string
}

export function AgenticAIChat({ userId, profile }: AgenticAIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hey ${profile?.name || "there"}! 👋 I'm your FitGrit AI coach. I can help you with workouts, meals, plans, and more. What would you like to work on today?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingAction, setPendingAction] = useState<Message | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

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

  // Conversation history will be loaded automatically as messages are sent
  // The conversationId is stored and passed with each request

  const sendMessage = async (messageText: string, confirmAction?: boolean) => {
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
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          userId,
          conversationId,
          confirmAction,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Update conversation ID if we got a new one
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        action: data.action,
        actionResult: data.actionResult,
        actionError: data.actionError,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // If action requires confirmation, store it for later
      if (data.requiresConfirmation && data.action) {
        setPendingAction(assistantMessage)
      } else {
        setPendingAction(null)
      }
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
    if (pendingAction) {
      // Confirm pending action
      sendMessage("Yes, please proceed", true)
      setPendingAction(null)
    } else {
      sendMessage(input)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsFullscreen(false)
    setIsMinimized(false)
  }

  const quickActions = [
    { label: "My knees hurt on squats", icon: "💪" },
    { label: "Log today's workout", icon: "🏋️" },
    { label: "Update my plan", icon: "📋" },
    { label: "Analyze my progress", icon: "📊" },
  ]

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110 relative group"
        >
          <div className="relative">
            <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
            <Sparkles className="h-3 w-3 text-yellow-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Coach
          </span>
        </Button>
      </div>
    )
  }

  const ChatContent = () => (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      {/* Aurora / neon backglow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.12),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.14),transparent_35%)] blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/3 to-transparent" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-slate-900/70 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/30" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-lg shadow-cyan-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight">FitGrit AI Coach</h3>
              <Badge className="bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/40">
                <Sparkles className="mr-1 h-3 w-3" />
                Agentic
              </Badge>
              <Badge className="bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/40">Live</Badge>
              <Badge className="bg-white/10 text-white/80 ring-1 ring-white/20">v2</Badge>
            </div>
            <p className="text-xs text-slate-200/70">Autonomous actions, adaptive guidance, always-on</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-white hover:bg-white/10"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0 text-white hover:bg-white/10"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="relative flex-1 px-4 py-3" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => {
                const isUser = message.role === "user"
                return (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                      <div className={`flex max-w-[85%] gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                        <div className="flex-shrink-0">
                          <div
                            className={`h-9 w-9 rounded-full shadow-lg ${
                              isUser
                                ? "bg-gradient-to-br from-sky-500 to-indigo-500 shadow-sky-500/25"
                                : "bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 shadow-fuchsia-500/25"
                            } flex items-center justify-center`}
                          >
                            {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
                          </div>
                        </div>
                        <div
                          className={`relative overflow-hidden rounded-2xl border ${
                            isUser
                              ? "border-sky-500/40 bg-gradient-to-br from-sky-900/60 via-indigo-900/60 to-indigo-900/60"
                              : "border-white/10 bg-white/5 backdrop-blur"
                          } p-4 shadow-lg shadow-black/30`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/0" />
                          <p className="relative text-sm leading-relaxed text-white/90 whitespace-pre-wrap">{message.content}</p>
                          {message.action && message.action.type !== "NONE" && (
                            <div className="relative mt-3 flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-100">
                              <Zap className="h-3 w-3" />
                              <span>Action: {message.action.type.replace(/_/g, " ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Result Indicators */}
                    {message.actionResult && (
                      <div className="ml-12">
                        <Alert
                          className={`border text-xs ${
                            message.actionResult.success
                              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                              : "border-amber-400/40 bg-amber-500/10 text-amber-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {message.actionResult.success ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-300" />
                            )}
                            <AlertDescription>{message.actionResult.message}</AlertDescription>
                          </div>
                        </Alert>
                      </div>
                    )}

                    {message.actionError && (
                      <div className="ml-12">
                        <Alert className="border border-red-400/40 bg-red-500/10 text-red-100 text-xs">
                          <AlertCircle className="h-4 w-4 text-red-200" />
                          <AlertDescription>{message.actionError}</AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                )
              })}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 shadow-fuchsia-500/25">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                      <span>Thinking and acting...</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300/80" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300/60 [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300/40 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Pending Action Confirmation */}
          {pendingAction && (
            <div className="border-t border-amber-400/20 bg-amber-500/10 px-4 pb-3 pt-2">
              <Alert className="border border-amber-400/30 bg-transparent text-amber-100">
                <AlertCircle className="h-4 w-4 text-amber-200" />
                <AlertDescription className="text-xs">
                  <strong>Action pending:</strong> {pendingAction.action?.type.replace(/_/g, " ")}. Type "yes" to confirm or
                  continue chatting.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="border-t border-white/5 bg-white/5 px-4 pb-3 pt-2 backdrop-blur">
              <p className="mb-2 px-1 text-xs text-white/70">Quick actions</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(action.label)}
                    className="h-8 border-cyan-400/30 bg-white/5 text-xs text-white hover:border-cyan-300 hover:bg-cyan-500/10"
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  pendingAction ? "Type 'yes' to confirm or continue chatting..." : "Ask your agentic coach anything..."
                }
                disabled={loading}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/30"
              />
              <Button
                type="submit"
                disabled={loading || (!input.trim() && !pendingAction)}
                className="rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-4 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 disabled:opacity-60"
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
        <DialogContent className="max-w-4xl h-[85vh] p-0">
          <ChatContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className={`w-96 shadow-2xl border-0 transition-all duration-300 ${isMinimized ? "h-16" : "h-[600px]"}`}>
        <ChatContent />
      </Card>
    </div>
  )
}

