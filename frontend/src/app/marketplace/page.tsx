"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useAuth } from "@/contexts/AuthContext"
import { marketplaceAPI } from "@/services/api"
import type { MarketplacePost, MarketplacePostForm } from "@/types"
import { Trash2, X, Calendar, DollarSign } from "lucide-react"
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
import { format } from "date-fns"

//categories for posts and sorting
const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "selling", label: "Selling" },
  { value: "buying", label: "Buying" },
  { value: "lost", label: "Lost and Found" },
]


export default function MarketplacePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<MarketplacePost[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MarketplacePostForm>()




  useEffect(() => {
    loadPosts()
  }, [])
  // loading posts from the database
  const loadPosts = async () => {
    setLoadingData(true)
    try {
      const response = await marketplaceAPI.getPosts()
        if (response.success && response.data?.posts) {
          setPosts(response.data.posts)
        }
    } catch (error) {
      console.error("Failed to load posts:", error)
      toast.error("Failed to load marketplace posts.")
    } finally {
      setLoadingData(false)
    }
}
//when creayting a post
const onSubmitPost = async (data: MarketplacePostForm) => {
  setIsSubmitting(true)
  try {
    const response = await marketplaceAPI.createPost(data)
    if (response.success) {
      toast.success("Post created successfully!")
      reset()
      setShowAddForm(false)
      loadPosts()
    } else {
      toast.error(response.message || "Failed to create post.")
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to create post.")
  } finally {
    setIsSubmitting(false)
  }
} 


const handleDeletePost = async (postId: string) => {
  if (!confirm("Are you sure you want to delete this post?")) return

  setDeletingPostId(postId)
  try {
    const response = await marketplaceAPI.deletePost(postId)
    if (response.success) {
      toast.success("Post deleted successfully!")
      loadPosts()
    } else {
      toast.error(response.message || "Failed to delete post.")
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to delete post.")
  } finally {
    setDeletingPostId(null)
  }
}


const filteredPosts = posts.filter(post => {
  const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       post.description.toLowerCase().includes(searchQuery.toLowerCase())
  const matchesCategory = selectedCategory === "" || post.category === selectedCategory
  return matchesSearch && matchesCategory
})



  if (loadingData) {
  return (
    <Layout>
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </Layout>
  )
}

  return (
      <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600 mt-2">Buy and sell items with other students and share lost items</p>
            </div>
          </div>
          {user && (
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {showAddForm ? "Hide Form" : "Post Item"}
            </Button>
          )}
        </div>
        
        {/* Add Item Form */}
        {showAddForm && user && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Post a New Item</h2>
            <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Item Title *"
                    {...register("title", { required: "Title is required" })}
                    error={errors.title?.message}
                    placeholder="e.g., iPhone 13 for Sale"
                  />
                </div>

                <div>
                  <Input
                    label="Price ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("price", {
                      min: { value: 0, message: "Price cannot be negative" },
                      pattern: { value: /^\d*\.?\d*$/, message: "Please enter a valid price" }
                    })}
                    error={errors.price?.message}
                    placeholder="299.99 (optional for Lost and Found)"
                  />
                </div>

                <div>
                  <Input
                    label="Contact Info *"
                    {...register("contact", { required: "Contact information is required" })}
                    error={errors.contact?.message}
                    placeholder="Email or phone number"
                  />
                </div>

                <div>
                  <Input
                    label="Image URL"
                    type="url"
                    {...register("image_url")}
                    error={errors.image_url?.message}
                    placeholder="https://example.com/product-image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    {...register("category")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    {CATEGORIES.slice(1).map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    {...register("description", { 
                      required: "Description is required",
                      maxLength: { value: 2000, message: "Description cannot exceed 2000 characters" }
                    })}
                    rows={4}
                    maxLength={2000}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe the item, condition, etc..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Post Item
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Categories */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search marketplace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </Card>








        {/* Posts Display */}
        {filteredPosts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500">
                {posts.length === 0 
                  ? "Be the first to post an item!" 
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                {/* Post Image */}
                {post.image_url && (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <div className="p-4">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      post.category === 'selling' ? 'bg-green-100 text-green-800' :
                      post.category === 'buying' ? 'bg-blue-100 text-blue-800' :
                      post.category === 'lost' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {CATEGORIES.find(cat => cat.value === post.category)?.label || post.category}
                    </span>
                    {(user?.id === post.creator_id || user?.role === 'admin') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPostId === post.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>

                  {/* Price */}
                  {post.price && (
                    <div className="flex items-center text-lg font-bold text-green-600 mb-2">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {post.price}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-7">{post.description}</p>

                  {/* Contact & Creator */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      Posted by {post.creator_name}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="w-4 h-4 mr-2" />
                      {post.contact}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        

        
      </div>
    </Layout>
  )
}