"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Settings, LogOut, LayoutDashboard, User, Flame, CreditCard, Bot } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

export function Navigation() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getUserInitials = (user: SupabaseUser) => {
    const email = user.email || ""
    return email.substring(0, 2).toUpperCase()
  }

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/setup", label: "Setup" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-shadow">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              FitGrit AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-6 bg-gray-200 mx-2" />

            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className={cn(
                      "rounded-lg",
                      isActive("/dashboard") && "bg-orange-50 text-orange-600"
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/dashboard/coach">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-lg",
                      isActive("/dashboard/coach") && "bg-orange-50 text-orange-600"
                    )}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    AI Coach
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-orange-100 hover:ring-orange-200 transition-all">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-medium">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-xl shadow-xl border border-gray-100" align="end" forceMount>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow">
                        <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900">{user.user_metadata?.full_name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard" className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4 text-gray-500" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/onboarding" className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-500" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4 text-gray-500" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/subscription" className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                        Subscription
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" className="rounded-lg">
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button asChild className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all">
                  <Link href="/auth">
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-fade-in-down">
            <div className="px-2 pt-2 pb-4 space-y-1 border-t bg-white rounded-b-2xl shadow-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-gray-100 my-2" />

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/coach"
                    className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bot className="h-4 w-4 mr-3" />
                    AI Coach
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-2 pt-2">
                  <Link
                    href="/auth"
                    className="block px-4 py-3 text-center rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth"
                    className="block px-4 py-3 text-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
