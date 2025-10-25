"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import Image from "next/image"
import {
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  Upload,
  Star,
  Users,
  QuoteIcon,
  DollarSign,
  Briefcase,
  Calendar,
  ShoppingCart,
} from "lucide-react"

// ADDED: Custom HouseHeart icon component
const HouseHeart = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.5 19l-5.6-5.6A3 3 0 013 10.68V9a3 3 0 013-3h12a3 3 0 013 3v1.68a3 3 0 01-.9 2.72L14.5 19" />
    <path d="M11.5 9.5l1.5-1.5a2.12 2.12 0 013 0l1.5 1.5" />
    <path d="M12.5 14.5l-1.5 1.5a2.12 2.12 0 01-3 0l-1.5-1.5" />
    <path d="M19 21l-7-4-7 4" />
  </svg>
)

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navigation = user
    ? [
        { name: "Dashboard", href: "/dashboard", icon: BookOpen },
        { name: "Notes", href: "/upload", icon: Upload },
        { name: "Courses", href: "/courses", icon: BookOpen },
        { name: "Reviews", href: "/reviews", icon: Star },
        { name: "Lecturers", href: "/lecturers", icon: Users },
        { name: "Quotes", href: "/quotes", icon: QuoteIcon },
        { name: "Deals", href: "/deals", icon: DollarSign },
        { name: "Jobs/Voluntary", href: "/jobs", icon: Briefcase },
        { name: "Events", href: "/events", icon: Calendar },
        { name: "Clubs", href: "/clubs", icon: HouseHeart },
        { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
      ]
    : []

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 backdrop-blur-lg border-b border-blue-500/20 shadow-lg responsive-header">
      <div className="w-full pl-6 pr-4 sm:pl-8 sm:pr-6 lg:pl-12 lg:pr-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                <Image src="/campus-icon.png" alt="Campus Connect Icon" width={32} height={32} className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold text-white whitespace-nowrap">Campus Connect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-white/90 hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all duration-300 backdrop-blur-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <User className="w-4 h-4 text-white/80" />
                  {/* profile link */}
                  <Link href="/profile" className="text-sm text-white/90 hover:underline">
                    {user.name}
                  </Link>
                  {user.role === "admin" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      Admin User
                    </span>
                  )}
                  {!user.verified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400/20 text-yellow-100 backdrop-blur-sm">
                      Unverified
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                  >
                    Login
                    </Button>
                  </Link>
                <Link href="/signup">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 bg-white/5 backdrop-blur-lg rounded-b-lg">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              {user && (
                <div className="pt-2 border-t border-white/20">
                  {/* profile and logout links */}
                  <Link href="/profile" className="block px-3 py-2 text-sm text-white/90 hover:underline" onClick={() => setMobileMenuOpen(false)}>
                    View profile
                  </Link>
                  <div className="px-3 py-2 text-sm text-white/70">Signed in as {user.name}</div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-white/90 hover:text-red-300 hover:bg-white/10 w-full text-left transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
