// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

// User types
export interface User {
  id: string
  name: string
  email: string
  verified: boolean
  role: "student" | "admin"
  created_at: string
}
// user profile types
export interface UserProfile {
  display_name: string | null
  profile_image_url?: string | null
  about?: string | null
  interests?: string[] | null
  current_courses?: string[] | null
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  token: string
  user: User
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
  review_count: number
  avg_rating: number
  avg_difficulty: number
  avg_workload: number
  created_at: string
  updated_at: string
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
  uploader_name: string
  course_name: string
  created_at: string
  updated_at: string
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
  reviewer_name: string
  course_name: string
  course_code: string
  created_at: string
  updated_at: string
}

// Lecturer types (NEW)
export interface Lecturer {
  id: string
  name: string
  profile_image_url?: string
  description?: string
  feedback_count: number
  avg_feedback_rating: number
  quote_count: number
  created_at: string
  updated_at: string
}

// Lecturer feedback types (MODIFIED)
export interface LecturerFeedback {
  id: string
  lecturer_id?: string
  lecturer_name?: string // Can be from DB or derived from lecturer_id
  course_id?: string
  user_id: string
  rating: number
  comment?: string
  anonymous: boolean
  teaching_quality?: number
  communication_rating?: number
  availability_rating?: number
  reviewer_name: string // From join
  course_name?: string // From join
  course_code?: string // From join
  created_at: string
  updated_at: string
}

// Quote types (NEW)
export interface Quote {
  id: string
  lecturer_id: string
  user_id: string
  quote_text: string
  context?: string
  lecturer_name: string // From join
  profile_image_url?: string // From join
  uploader_name: string // From join
  created_at: string
  updated_at: string
}

// Event types (NEW)
export interface Event {
  id: string
  user_id: string
  event_name: string
  event_place: string
  event_time: string
  event_type: "concert" | "workshop" | "meetup" | "conference" | "social" | "academic" | "sports" | "other"
  event_description?: string
  event_location: string
  image_url?: string
  is_active: boolean
  organizer_name: string // From join
  interested_count: number // From aggregation
  not_interested_count: number // From aggregation
  user_interest?: "interested" | "not_interested" // User's current interest
  created_at: string
  updated_at: string
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
  expires_at?: string
  is_active: boolean
  uploader_name: string // From join
  upvotes: number // From aggregation
  downvotes: number // From aggregation
  user_vote?: "up" | "down" // User's current vote
  created_at: string
  updated_at: string
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
  expires_at: string
  is_active: boolean
  poster_name: string // From join
  upvotes: number // From aggregation
  downvotes: number // From aggregation
  user_vote?: "up" | "down" // User's current vote
  comment_count: number // From aggregation
  created_at: string
  updated_at: string
}

// Job comment types (NEW)
export interface JobComment {
  id: string
  job_id: string
  user_id: string
  comment_text: string
  commenter_name: string // From join
  created_at: string
  updated_at: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}
// user profile form types
export interface UpdateProfileForm {
  display_name?: string
  profile_image_url?: string
  about?: string
  interests?: string[] | string
  current_courses?: string[] | string
  is_public?: boolean
}

export interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}

export interface NoteUploadForm {
  course_code: string
  title: string
  type: "lecture_notes" | "assignment" | "exam_prep" | "tutorial" | "other"
  description?: string
  file: File
}

export interface ReviewForm {
  course_id: string
  rating: number
  comment?: string
  anonymous: boolean
  difficulty_rating?: number
  workload_rating?: number
  would_recommend?: boolean
}

// Lecturer feedback form (MODIFIED)
export interface LecturerFeedbackForm {
  lecturer_id?: string
  lecturer_name?: string
  course_id?: string
  rating: number
  comment?: string
  anonymous: boolean
  teaching_quality?: number
  communication_rating?: number
  availability_rating?: number
}

// Lecturer form (NEW)
export interface LecturerForm {
  name: string
  profile_image_url?: string
  description?: string
}

// Quote form (NEW)
export interface QuoteForm {
  lecturer_id: string
  quote_text: string
  context?: string
}

// Event form (NEW)
export interface EventForm {
  event_name: string
  event_place: string
  event_time: string
  event_type: "concert" | "workshop" | "meetup" | "conference" | "social" | "academic" | "sports" | "other"
  event_description?: string
  event_location: string
  image_url?: string
}

// Deal form (NEW)
export interface DealForm {
  title: string
  description?: string
  original_price?: string
  deal_price?: string
  website_url?: string
  website_name?: string
  category?: string
  image_url?: string
  expires_at?: string
}

// Club types
export interface Club {
  id: string
  user_id: string
  name: string
  description: string
  location?: string
  club_type: "academic" | "sports" | "cultural" | "social" | "professional" | "religious" | "political" | "other"
  club_date?: string
  club_time?: string
  image_url?: string
  members_count: number
  is_active: boolean
  created_at: string
  updated_at: string
  creator_name?: string
  creator_id: string;
}

export interface ClubMember {
  id: string
  club_id: string
  user_id: string
  role: "member" | "admin" | "moderator"
  join_date: string
}

export interface ClubPost {
  id: string
  club_id: string
  user_id: string
  title: string
  content: string
  is_announcement: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  author_name?: string
}

export interface ClubApplication {
  id: string;
  club_id: string;
  user_id: string;
  name: string;
  student_id: string;
  reason: string;
  status: string;
  created_at: string;
  email?: string;
}
