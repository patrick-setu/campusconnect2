import type { Request, Response, NextFunction } from "express"
import Joi from "joi"
import type { ApiResponse } from "@/types"

// Validation schemas
export const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string()
    .email()
    .pattern(/@autuni\.ac\.nz$/)
    .required()
    .messages({
      "string.pattern.base": "Email must be from AUT University (@autuni.ac.nz)",
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required(),
})

export const createNoteSchema = Joi.object({
  course_code: Joi.string().required(),
  title: Joi.string().min(1).max(200).required(),
  type: Joi.string().valid("lecture_notes", "assignment", "exam_prep", "tutorial", "other").required(),
  description: Joi.string().max(1000).optional().allow(""),
})

export const createReviewSchema = Joi.object({
  course_id: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional().allow(""),
  anonymous: Joi.boolean().optional(),
  difficulty_rating: Joi.number().integer().min(1).max(5).optional(),
  workload_rating: Joi.number().integer().min(1).max(5).optional(),
  would_recommend: Joi.boolean().optional(),
})

export const createLecturerFeedbackSchema = Joi.object({
  lecturer_id: Joi.string().uuid().optional(),
  lecturer_name: Joi.string().min(1).max(100).optional(),
  course_id: Joi.string().uuid().optional(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional().allow(""),
  anonymous: Joi.boolean().optional(),
  teaching_quality: Joi.number().integer().min(1).max(5).optional(),
  communication_rating: Joi.number().integer().min(1).max(5).optional(),
  availability_rating: Joi.number().integer().min(1).max(5).optional(),
})

// Fixed lecturer schema - removed the xor constraint that was causing issues
export const createLecturerSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().required().messages({
    "string.empty": "Lecturer name is required",
    "string.min": "Lecturer name must be at least 1 character long",
    "string.max": "Lecturer name must be less than 100 characters",
    "any.required": "Lecturer name is required",
  }),
  profile_image_url: Joi.string().uri().max(500).optional().allow("", null),
  description: Joi.string().max(1000).optional().allow("", null),
})

export const createQuoteSchema = Joi.object({
  lecturer_id: Joi.string().uuid().required(),
  quote_text: Joi.string().min(1).max(1000).required(),
  context: Joi.string().max(500).optional().allow(""),
})

export const createDealSchema = Joi.object({
  title: Joi.string().min(1).max(500).required(),
  description: Joi.string().max(2000).optional().allow(""),
  original_price: Joi.number().positive().optional(),
  deal_price: Joi.number().positive().optional(),
  website_url: Joi.string().uri().max(500).optional().allow(""),
  website_name: Joi.string().max(100).optional().allow(""),
  category: Joi.string()
    .valid("computing", "electronics", "software", "gaming", "books", "food", "clothing", "general")
    .default("general"),
  image_url: Joi.string().uri().max(500).optional().allow(""),
  expires_at: Joi.date().iso().optional(),
})

export const createJobSchema = Joi.object({
  title: Joi.string().min(1).max(500).required(),
  job_type: Joi.string().valid("part-time", "full-time", "casual", "voluntary").required(),
  pay_rate: Joi.string().max(100).optional().allow(""),
  pay_type: Joi.string().valid("hourly", "weekly", "fixed", "unpaid").optional(),
  description: Joi.string().max(2000).optional().allow(""),
  location: Joi.string().min(1).max(200).required(),
  contact_info: Joi.string().min(1).max(1000).required(),
  expires_at: Joi.date().iso().greater("now").required().messages({
    "date.greater": "Expiry date must be in the future",
  }),
})

export const createJobCommentSchema = Joi.object({
  comment_text: Joi.string().min(1).max(1000).required(),
})

export const createCourseSchema = Joi.object({
  code: Joi.string().min(1).max(20).required().messages({
    "string.empty": "Course code is required",
    "any.required": "Course code is required",
  }),
  name: Joi.string().min(1).max(200).required().messages({
    "string.empty": "Course name is required",
    "any.required": "Course name is required",
  }),
  description: Joi.string().max(1000).optional().allow(""),
  faculty: Joi.string()
    .valid(
      "business",
      "design_creative",
      "engineering_computer_mathematical",
      "health_environmental",
      "maori_indigenous",
    )
    .required(),
  year: Joi.number().integer().min(1).max(4).required(),
  credits: Joi.number().integer().min(1).max(50).required(),
})

export const createEventSchema = Joi.object({
  event_name: Joi.string().min(1).max(500).required(),
  event_place: Joi.string().min(1).max(200).required(),
  event_time: Joi.date().iso().required().messages({
    "date.greater": "Event time must be in the future",
  }),
  event_type: Joi.string()
    .valid("concert", "workshop", "meetup", "conference", "social", "academic", "sports", "other")
    .required(),
  event_description: Joi.string().max(2000).optional().allow(""),
  event_location: Joi.string().min(1).max(500).required(),
  image_url: Joi.string().uri().max(500).optional().allow(""),
})

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    console.log("Validating request body:", req.body)

    const { error, value } = schema.validate(req.body, {
      stripUnknown: true,
      abortEarly: false,
      allowUnknown: false,
    })

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message).join(", ")
      console.log("Validation error:", errorMessages)
      console.log("Error details:", error.details)

      res.status(400).json({
        success: false,
        message: "Validation error",
        error: errorMessages,
      })
      return
    }

    console.log("Validation successful, validated data:", value)
    // Replace req.body with validated and sanitized data
    req.body = value
    next()
  }
}

export const createClubSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    "string.empty": "Club name is required",
    "string.min": "Club name must be at least 1 character long",
    "string.max": "Club name must be less than 200 characters",
    "any.required": "Club name is required",
  }),
  description: Joi.string().min(1).max(1000).required().messages({ // ← Changed to required
    "string.empty": "Club description is required",
    "string.min": "Club description must be at least 1 character long",
    "string.max": "Club description must be less than 1000 characters",
    "any.required": "Club description is required",
  }),
  location: Joi.string().max(200).optional().allow(""),
  club_date: Joi.date().iso().optional(),
  club_time: Joi.string().max(50).optional().allow(""),
  image_url: Joi.string().uri().max(500).optional().allow(""),
  join_link: Joi.string().uri().max(500).optional().allow(""),
  is_active: Joi.boolean().default(true),
})

export const createClubPostSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  is_pinned: Joi.boolean().default(false),
})

export const createMarketplacePostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).required(),
  price: Joi.string().max(50).optional().allow(""),
  category: Joi.string().valid("selling", "lost", "buying").required(),
  contact: Joi.string().min(1).max(255).required(),
  image_url: Joi.string().uri().max(500).optional().allow(""),
})
