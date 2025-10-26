import type { Request } from "express"

// User types
export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  verified: boolean
  role: "student" | "admin"
  verification_token?: string
  reset_token?: string
  reset_token_expires?: Date
  created_at: Date
  updated_at: Date
}

export interface UserPayload {
  id: string
  email: string
  role: "student" | "admin"
  verified: boolean
}

// Course types
export interface Course {
  id: string
  name: string
  code: string
  faculty:
    | "business"
    | "design_creative"
    | "engineering_computer_mathematical"
    | "health_environmental"
    | "maori_indigenous"
  year: number
  description?: string
  credits: number
  created_at: Date
  updated_at: Date
}

// Note types
export interface Note {
  id: string
  uploader_id: string
  course_code: string
  title: string
  type: "lecture_notes" | "assignment" | "exam_prep" | "tutorial" | "other"
  file_path: string
  file_size?: number
  description?: string
  download_count: number
  approved: boolean
  created_at: Date
  updated_at: Date
}

// Review types
export interface Review {
  id: string
  course_id: string
  user_id: string
  rating: number
  comment?: string
  anonymous: boolean
  difficulty_rating?: number
  workload_rating?: number
  would_recommend?: boolean
  created_at: Date
  updated_at: Date
}

// Lecturer types (NEW)
export interface Lecturer {
  id: string
  name: string
  profile_image_url?: string
  description?: string
  created_at: Date
  updated_at: Date
}

// Lecturer feedback types (MODIFIED)
export interface LecturerFeedback {
  id: string
  lecturer_id?: string // NEW: Optional, for linking to lecturers table
  lecturer_name?: string // Kept for display/backward compatibility
  course_id?: string
  user_id: string
  rating: number
  comment?: string
  anonymous: boolean
  teaching_quality?: number
  communication_rating?: number
  availability_rating?: number
  created_at: Date
  updated_at: Date
}

// Quote types (NEW)
export interface Quote {
  id: string
  lecturer_id: string
  user_id: string
  quote_text: string
  context?: string
  created_at: Date
  updated_at: Date
}

// Deal types (NEW)
export interface Deal {
  id: string
  user_id: string
  title: string
  description?: string
  original_price?: number
  deal_price?: number
  discount_percentage?: number
  website_url?: string
  website_name?: string
  category: string
  image_url?: string
  expires_at?: Date
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Additional fields from joins
  uploader_name?: string
  upvotes?: number
  downvotes?: number
  user_vote?: "up" | "down"
}

// Event types (NEW)
export interface Event {
  id: string
  user_id: string
  event_name: string
  event_place: string
  event_time: Date
  event_type: "concert" | "workshop" | "meetup" | "conference" | "social" | "academic" | "sports" | "other"
  event_description?: string
  event_location: string
  image_url?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Additional fields from joins
  organizer_name?: string
  interested_count?: number
  not_interested_count?: number
  user_interest?: "interested" | "not_interested"
}

// Job types (NEW)
export interface Job {
  id: string
  user_id: string
  title: string
  job_type: "part-time" | "full-time" | "casual" | "voluntary"
  pay_rate?: string
  pay_type?: "hourly" | "weekly" | "fixed" | "unpaid"
  description?: string
  location: string
  contact_info: string
  expires_at: Date
  is_active: boolean
  created_at: Date
  updated_at: Date
  // Additional fields from joins
  poster_name?: string
  upvotes?: number
  downvotes?: number
  user_vote?: "up" | "down"
  comment_count?: number
}

// Job comment types (NEW)
export interface JobComment {
  id: string
  job_id: string
  user_id: string
  comment_text: string
  created_at: Date
  updated_at: Date
  // Additional fields from joins
  commenter_name?: string
}

// Marketplace types 
export interface MarketplacePost {
  id: string
  creator_id: string
  title: string
  description: string
  price?: string
  category: 'selling' | 'lost' | 'buying'
  contact: string
  image_url?: string
  created_at: Date
  // Additional fields from joins
  creator_name?: string
}

// Request types
export interface AuthenticatedRequest extends Request {
  user?: UserPayload
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// user profile types
export interface UserProfile {
  display_name: string | null
  profile_image_url?: string | null
  about?: string | null
  interests?: string[] | null
  current_courses?: string[] | null
  created_at?: Date
  updated_at?: Date
}

// Auth request types
export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Note request types
export interface CreateNoteRequest {
  course_code: string
  title: string
  type: "lecture_notes" | "assignment" | "exam_prep" | "tutorial" | "other"
  description?: string
}

// Review request types
export interface CreateReviewRequest {
  course_id: string
  rating: number
  comment?: string
  anonymous?: boolean
  difficulty_rating?: number
  workload_rating?: number
  would_recommend?: boolean
}

// Lecturer feedback request types (MODIFIED)
export interface CreateLecturerFeedbackRequest {
  lecturer_id?: string // NEW: Prefer ID if available
  lecturer_name?: string // Fallback/display name
  course_id?: string
  rating: number
  comment?: string
  anonymous?: boolean
  teaching_quality?: number
  communication_rating?: number
  availability_rating?: number
}

// Lecturer request types (NEW)
export interface CreateLecturerRequest {
  name: string
  profile_image_url?: string
  description?: string
}

// Quote request types (NEW)
export interface CreateQuoteRequest {
  lecturer_id: string
  quote_text: string
  context?: string
}

// Deal request types (NEW)
export interface CreateDealRequest {
  title: string
  description?: string
  original_price?: number
  deal_price?: number
  website_url?: string
  website_name?: string
  category?: string
  image_url?: string
  expires_at?: string
}

// Event request types (NEW)
export interface CreateEventRequest {
  event_name: string
  event_place: string
  event_time: string
  event_type: "concert" | "workshop" | "meetup" | "conference" | "social" | "academic" | "sports" | "other"
  event_description?: string
  event_location: string
  image_url?: string
}

// Job request types (NEW)
export interface CreateJobRequest {
  title: string
  job_type: "part-time" | "full-time" | "casual" | "voluntary"
  pay_rate?: string
  pay_type?: "hourly" | "weekly" | "fixed" | "unpaid"
  description?: string
  location: string
  contact_info: string
  expires_at: string
}

// Job comment request types (NEW)
export interface CreateJobCommentRequest {
  comment_text: string
}

// Marketplace request types (NEW)
export interface CreateMarketplacePostRequest {
  title: string
  description: string
  price?: string
  category: 'selling' | 'lost' | 'buying'
  contact: string
  image_url?: string
}



// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'clubs' | 'notes' | 'marketplace';
  tier: 'bronze' | 'silver' | 'gold';
  requirement_count: number;
  icon_url?: string;
  created_at: Date;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: Date;
  badge?: Badge; // For joined queries
}

export interface BadgeProgress {
  category: 'clubs' | 'notes' | 'marketplace';
  current_count: number;
  badges: {
    badge: Badge;
    earned: boolean;
    earned_at?: Date;
  }[];
}

// Badge request types
export interface BadgeEarnedResponse {
  newBadges: Badge[];
}