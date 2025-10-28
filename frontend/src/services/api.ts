import axios, { type AxiosResponse } from "axios"
import Cookies from "js-cookie"
import type {
  ApiResponse,
  AuthResponse,
  User,
  UserProfile,
  Course,
  Note,
  Review,
  Lecturer,
  LecturerFeedback,
  Quote,
  Deal,
  Job,
  JobComment,
  Event,
  Club,
  ClubMember,
  ClubPost,
  MarketplacePost,
  MarketplacePostForm,
  UserBadge,
  BadgeProgress,
} from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  signup: async (data: {
    name: string
    email: string
    password: string
  }): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.post("/auth/signup", data)
    return response.data
  },

  login: async (data: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post("/auth/login", data)
    return response.data
  },

  verifyEmail: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.post("/auth/verify", { token })
    return response.data
  },

  requestPasswordReset: async (email: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post("/auth/request-reset", { email })
    return response.data
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post("/auth/reset-password", { token, newPassword })
    return response.data
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get("/auth/profile")
    return response.data
  },

  updateProfile: async (data: { name: string }): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.put("/auth/profile", data)
    return response.data
  },
}

// user profile API, get and update student profiles
export const userAPI = {
  // get user profile
  getMyProfile: async (): Promise<ApiResponse<{ user: User; profile: UserProfile }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User; profile: UserProfile }>> = await api.get("/users/me")
    return response.data
  },
  // update user profile
  updateMyProfile: async (
    data: Partial<UserProfile>,
  ): Promise<ApiResponse<{ profile: UserProfile }>> => {
    const response: AxiosResponse<ApiResponse<{ profile: UserProfile }>> = await api.put("/users/me", data)
    return response.data
  },
  // view different users profile
  getUserPublicProfile: async (
    id: string,
  ): Promise<ApiResponse<{ user: Pick<User, "id" | "name" | "verified" | "role" | "created_at">; profile: UserProfile }>> => {
    const response: AxiosResponse<ApiResponse<{ user: any; profile: UserProfile }>> = await api.get(`/users/${id}`)
    return response.data
  },
}

// Course API
export const courseAPI = {
  getCourses: async (params?: {
    faculty?: string
    year?: number
    search?: string
  }): Promise<ApiResponse<{ courses: Course[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ courses: Course[]; total: number }>> = await api.get("/courses", {
      params,
    })
    return response.data
  },

  getCourse: async (id: string): Promise<ApiResponse<{ course: Course; recent_reviews: Review[] }>> => {
    const response: AxiosResponse<ApiResponse<{ course: Course; recent_reviews: Review[] }>> = await api.get(
      `/courses/${id}`,
    )
    return response.data
  },

  createCourse: async (data: {
    code: string
    name: string
    description?: string
    faculty: string
    year: number
    credits: number
  }): Promise<ApiResponse<{ course: Course }>> => {
    const response: AxiosResponse<ApiResponse<{ course: Course }>> = await api.post("/courses", data)
    return response.data
  },

  deleteCourse: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/courses/${id}`)
    return response.data
  },
}

// Note API
export const noteAPI = {
  getNotes: async (params?: {
    course_code?: string
    type?: string
    search?: string
  }): Promise<ApiResponse<{ notes: Note[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ notes: Note[]; total: number }>> = await api.get("/notes", { params })
    return response.data
  },

  uploadNote: async (formData: FormData): Promise<ApiResponse<{ note: Note }>> => {
    const response: AxiosResponse<ApiResponse<{ note: Note }>> = await api.post("/notes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  downloadNote: async (id: string): Promise<void> => {
    const response = await api.get(`/notes/download/${id}`, {
      responseType: "blob",
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url

    let filename = "download.zip" // Default fallback with .zip extension

    const contentDisposition = response.headers["content-disposition"]
    if (contentDisposition) {
      // Try multiple patterns to extract filename
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "")
      }
    }

    // Ensure filename has .zip extension
    if (!filename.toLowerCase().endsWith(".zip")) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "")
      filename = `${nameWithoutExt}.zip`
    }

    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  getUserNotes: async (): Promise<ApiResponse<{ notes: Note[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ notes: Note[]; total: number }>> = await api.get("/notes/my-notes")
    return response.data
  },

  deleteNote: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/notes/${id}`)
    return response.data
  },

  getAllNotes: async (): Promise<ApiResponse<{ notes: Note[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ notes: Note[]; total: number }>> = await api.get("/notes/admin/all")
    return response.data
  },
}

// Review API
export const reviewAPI = {
  getReviews: async (params?: {
    course_id?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ reviews: Review[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ reviews: Review[]; total: number }>> = await api.get("/reviews", {
      params,
    })
    return response.data
  },

  createReview: async (data: {
    course_id: string
    rating: number
    comment?: string
    anonymous?: boolean
    difficulty_rating?: number
    workload_rating?: number
    would_recommend?: boolean
  }): Promise<ApiResponse<{ review: Review }>> => {
    const response: AxiosResponse<ApiResponse<{ review: Review }>> = await api.post("/reviews", data)
    return response.data
  },

  deleteReview: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/reviews/${id}`)
    return response.data
  },

  getUserReviews: async (): Promise<ApiResponse<{ reviews: Review[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ reviews: Review[]; total: number }>> =
      await api.get("/reviews/my-reviews")
    return response.data
  },
}

// Lecturer API
export const lecturerAPI = {
  getLecturers: async (params?: { search?: string }): Promise<
    ApiResponse<{ lecturers: Lecturer[]; total: number }>
  > => {
    const response: AxiosResponse<ApiResponse<{ lecturers: Lecturer[]; total: number }>> = await api.get("/lecturers", {
      params,
    })
    return response.data
  },
  getLecturer: async (
    id: string,
  ): Promise<ApiResponse<{ lecturer: Lecturer; recent_feedback: LecturerFeedback[]; recent_quotes: Quote[] }>> => {
    const response: AxiosResponse<
      ApiResponse<{ lecturer: Lecturer; recent_feedback: LecturerFeedback[]; recent_quotes: Quote[] }>
    > = await api.get(`/lecturers/${id}`)
    return response.data
  },
  createLecturer: async (data: {
    name: string
    description?: string
  }): Promise<ApiResponse<{ lecturer: Lecturer }>> => {
    const response: AxiosResponse<ApiResponse<{ lecturer: Lecturer }>> = await api.post("/lecturers", data)
    return response.data
  },

  deleteLecturer: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/lecturers/${id}`)
    return response.data
  },
}

// Lecturer Feedback API
export const lecturerFeedbackAPI = {
  getFeedback: async (params?: {
    lecturer_id?: string
    course_id?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ feedback: LecturerFeedback[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ feedback: LecturerFeedback[]; total: number }>> = await api.get(
      "/lecturer-feedback",
      { params },
    )
    return response.data
  },
  createFeedback: async (data: {
    lecturer_id?: string
    lecturer_name?: string
    course_id?: string
    rating: number
    comment?: string
    anonymous?: boolean
    teaching_quality?: number
    communication_rating?: number
    availability_rating?: number
  }): Promise<ApiResponse<{ feedback: LecturerFeedback }>> => {
    const response: AxiosResponse<ApiResponse<{ feedback: LecturerFeedback }>> = await api.post(
      "/lecturer-feedback",
      data,
    )
    return response.data
  },
  getUserFeedback: async (): Promise<ApiResponse<{ feedback: LecturerFeedback[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ feedback: LecturerFeedback[]; total: number }>> = await api.get(
      "/lecturer-feedback/my-feedback",
    )
    return response.data
  },
}

// Quote API
export const quoteAPI = {
  getQuotes: async (params?: {
    lecturer_id?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ quotes: Quote[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ quotes: Quote[]; total: number }>> = await api.get("/quotes", {
      params,
    })
    return response.data
  },
  createQuote: async (data: {
    lecturer_id: string
    quote_text: string
    context?: string
  }): Promise<ApiResponse<{ quote: Quote }>> => {
    const response: AxiosResponse<ApiResponse<{ quote: Quote }>> = await api.post("/quotes", data)
    return response.data
  },
  deleteQuote: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/quotes/${id}`)
    return response.data
  },
}

// Deal API
export const dealAPI = {
  getDeals: async (params?: {
    category?: string
    search?: string
    sort?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ deals: Deal[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ deals: Deal[]; total: number }>> = await api.get("/deals", {
      params,
    })
    return response.data
  },
  createDeal: async (data: {
    title: string
    description?: string
    original_price?: number
    deal_price?: number
    website_url?: string
    website_name?: string
    category?: string
    image_url?: string
    expires_at?: string
  }): Promise<ApiResponse<{ deal: Deal }>> => {
    const response: AxiosResponse<ApiResponse<{ deal: Deal }>> = await api.post("/deals", data)
    return response.data
  },
  voteDeal: async (id: string, vote_type: "up" | "down"): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/deals/${id}/vote`, { vote_type })
    return response.data
  },
  deleteDeal: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/deals/${id}`)
    return response.data
  },
}

// Job API
export const jobAPI = {
  getJobs: async (params?: {
    job_type?: string
    location?: string
    search?: string
    sort?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ jobs: Job[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ jobs: Job[]; total: number }>> = await api.get("/jobs", {
      params,
    })
    return response.data
  },
  createJob: async (data: {
    title: string
    job_type: "part-time" | "full-time" | "casual" | "voluntary"
    pay_rate?: string
    pay_type?: "hourly" | "weekly" | "fixed" | "unpaid"
    description?: string
    location: string
    contact_info: string
    expires_at: string
  }): Promise<ApiResponse<{ job: Job }>> => {
    const response: AxiosResponse<ApiResponse<{ job: Job }>> = await api.post("/jobs", data)
    return response.data
  },
  voteJob: async (id: string, vote_type: "up" | "down"): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/jobs/${id}/vote`, { vote_type })
    return response.data
  },
  deleteJob: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/jobs/${id}`)
    return response.data
  },
  getJobComments: async (
    id: string,
    params?: { limit?: number; offset?: number },
  ): Promise<ApiResponse<{ comments: JobComment[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ comments: JobComment[]; total: number }>> = await api.get(
      `/jobs/${id}/comments`,
      { params },
    )
    return response.data
  },
  createJobComment: async (
    id: string,
    data: { comment_text: string },
  ): Promise<ApiResponse<{ comment: JobComment }>> => {
    const response: AxiosResponse<ApiResponse<{ comment: JobComment }>> = await api.post(`/jobs/${id}/comments`, data)
    return response.data
  },
  deleteJobComment: async (commentId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/jobs/comments/${commentId}`)
    return response.data
  },
}

// Event API
export const eventAPI = {
  getEvents: async (params?: {
    event_type?: string
    search?: string
    sort?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ events: Event[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ events: Event[]; total: number }>> = await api.get("/events", {
      params,
    })
    return response.data
  },
  createEvent: async (data: {
    event_name: string
    event_place: string
    event_time: string
    event_type: string
    event_description?: string
    event_location: string
    image_url?: string
  }): Promise<ApiResponse<{ event: Event }>> => {
    const response: AxiosResponse<ApiResponse<{ event: Event }>> = await api.post("/events", data)
    return response.data
  },
  markInterest: async (id: string, interest_type: "interested" | "not_interested"): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/events/${id}/interest`, { interest_type })
    return response.data
  },
  deleteEvent: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/events/${id}`)
    return response.data
  },
}

// assignment tracker API
export const assignmentAPI = {
  // fetch the current user's assignments
  getAssignments: async (): Promise<ApiResponse<{ assignments: any[]; total: number }>> => {
  const response: AxiosResponse<ApiResponse<{ assignments: any[]; total: number }>> = await api.get('/assignments')
  return response.data
  },
  // create a new assignment (needs title and due date)
  createAssignment: async (data: { course_code?: string; title: string; details?: string; due_date: string }) => {
  const response: AxiosResponse<ApiResponse<{ assignment: any }>> = await api.post('/assignments', data)
  return response.data
  },
  // update an assignment
  updateAssignment: async (
    id: string,
    data: Partial<{ course_code: string; title: string; details: string; due_date: string }>,
  ): Promise<ApiResponse<{ assignment: any }>> => {
    const response: AxiosResponse<ApiResponse<{ assignment: any }>> = await api.put(`/assignments/${id}`, data)
    return response.data
  },
  // delete an assignment
  deleteAssignment: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/assignments/${id}`)
    return response.data
  },
}


// Club API
export const clubAPI = {
  getClubs: async (params?: { club_type?: string }): Promise<ApiResponse<{ clubs: Club[] }>> => {
    const response: AxiosResponse<ApiResponse<{ clubs: Club[] }>> = await api.get("/clubs", { params })
    return response.data
  },

  // fetch a club
  getClub: async (id: string): Promise<ApiResponse<{ club: Club; members: ClubMember[]; posts: ClubPost[] }>> => {
    const response: AxiosResponse<ApiResponse<{ club: Club; members: ClubMember[]; posts: ClubPost[] }>> = await api.get(`/clubs/${id}`)
    return response.data
  },

  createClub: async (data: { 
    name: string; 
    description?: string;
    club_type?: string;
    location?: string;
    club_date?: string;
    club_time?: string;
    image_url?: string;
    join_link?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<{ club: Club }>> => {
    const response: AxiosResponse<ApiResponse<{ club: Club }>> = await api.post("/clubs", data)
    return response.data
  },

  deleteClub: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/clubs/${id}`)
    return response.data
  },

  // Club membership
  joinClub: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/clubs/${id}/join`)
    return response.data
  },

  leaveClub: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/clubs/${id}/leave`)
    return response.data
  },

  // Club posts
  getPosts: async (clubId: string, params?: { limit?: number; offset?: number }): Promise<ApiResponse<{ posts: ClubPost[] }>> => {
    const response: AxiosResponse<ApiResponse<{ posts: ClubPost[] }>> = await api.get(`/clubs/${clubId}/posts`, { params })
    return response.data
  },

  // create a club post, can upload photos and videos
  createPost: async (
    clubId: string,
    data: { title?: string; content: string; is_pinned?: boolean; is_announcement?: boolean; media_urls?: string[] }
  ): Promise<ApiResponse<{ post: ClubPost }>> => {
    const response: AxiosResponse<ApiResponse<{ post: ClubPost }>> = await api.post(`/clubs/${clubId}/posts`, data)
    return response.data
  },

  // delete a club post if user is admin
  deletePost: async (clubId: string, postId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/clubs/${clubId}/posts/${postId}`)
    return response.data
  },

  // upload photos and media 
  uploadClubMedia: async (clubId: string, files: File[]): Promise<ApiResponse<{ urls: string[] }>> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('media', f));
    const response: AxiosResponse<ApiResponse<{ urls: string[] }>> = await api.post(`/clubs/${clubId}/posts/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  applyToClub: async (
    clubId: string,
    form: { name: string; studentId: string; reason: string }
  ) => {
    const response = await api.post(`/clubs/apply/${clubId}`, form);
    return response.data;
  },

  getClubApplications: async (clubId: string) => {
    const response = await api.get(`/clubs/${clubId}/applications`);
    return response.data;
  },
  handleClubApplication: async (clubId: string, appId: string, action: "accept" | "deny") => {
    const response = await api.post(`/clubs/${clubId}/applications/${appId}`, { action });
    return response.data;
  },

  // get club members 
  getClubMembers: async (clubId: string): Promise<ApiResponse<{ members: any[]; total: number }>> => {
    const response: AxiosResponse<ApiResponse<{ members: any[]; total: number }>> = await api.get(`/clubs/${clubId}/members`);
    return response.data;
  },
}

// Marketplace API
export const marketplaceAPI = {
  getPosts: async (): Promise<ApiResponse<{ posts: MarketplacePost[] }>> => {
    const response: AxiosResponse<ApiResponse<{ posts: MarketplacePost[] }>> = await api.get("/marketplace")
    return response.data
  },

  createPost: async (data: MarketplacePostForm): Promise<ApiResponse<{ post: MarketplacePost }>> => {
    const response: AxiosResponse<ApiResponse<{ post: MarketplacePost }>> = await api.post("/marketplace", data)
    return response.data
  },

  deletePost: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/marketplace/${id}`)
    return response.data
  },
}

// Badge API 
export const badgeAPI = {
  getBadgeProgress: async (userId: string): Promise<ApiResponse<{ progress: BadgeProgress[] }>> => {
    const response: AxiosResponse<ApiResponse<{ progress: BadgeProgress[] }>> = await api.get(`/badges/progress/${userId}`)
    return response.data
  },

  getUserBadges: async (userId: string): Promise<ApiResponse<{ badges: UserBadge[] }>> => {
    const response: AxiosResponse<ApiResponse<{ badges: UserBadge[] }>> = await api.get(`/badges/user/${userId}`)
    return response.data
  },
}

export default api
//view button 
export async function getClubById(clubId: string) {
  const res = await fetch(`/api/clubs/${clubId}`);
  return res.json();
};