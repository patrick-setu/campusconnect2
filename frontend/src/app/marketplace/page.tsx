"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useAuth } from "@/contexts/AuthContext"
import {
  PlusCircle,
  Search,
  ShoppingCart,
  Heart,
  ExternalLink,
  User,
  Mail,
  Phone,
} from "lucide-react"

export default function MarketplacePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>           ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Buy and sell items with other students and share lost items 
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search marketplace..."
                className="pl-10"
              />
            </div>
          </div>
          <Button className="w-full sm:w-auto">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        

        
      </div>
    </Layout>
  )
}