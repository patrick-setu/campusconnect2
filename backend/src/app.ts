import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import path from "path"
import dotenv from "dotenv"

// Import routes
import authRoutes from "@/routes/auth"
import courseRoutes from "@/routes/courses"
import noteRoutes from "@/routes/notes"
import reviewRoutes from "@/routes/reviews"
import lecturerRoutes from "@/routes/lecturers" // NEW
import lecturerFeedbackRoutes from "@/routes/lecturerFeedback" // MODIFIED
import quoteRoutes from "@/routes/quotes" // NEW
import dealRoutes from "@/routes/deals" // Added deals routes
import jobRoutes from "@/routes/jobs" // Added jobs routes
import eventRoutes from "@/routes/events" // Added events routes
import clubsRouter from "./routes/clubs";  // Added clubs routes
import userRoutes from "@/routes/users" // add user routes
import marketplaceRoutes from "@/routes/marketplace" // Added marketplace routes
import assignmentsRoutes from "@/routes/assignments" // assignment routes
import badgeRoutes from "@/routes/badges" // Added badges routes


// Load environment variables
dotenv.config()

const app = express()

// Security middleware
// allow images or videos from  backend to be shown on the frontend 
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
})
app.use(limiter)

// Logging
app.use(morgan("combined"))

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files (for file downloads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Campus Connect NZ API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/notes", noteRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/lecturers", lecturerRoutes) // NEW
app.use("/api/lecturer-feedback", lecturerFeedbackRoutes) // MODIFIED
app.use("/api/quotes", quoteRoutes) // NEW
app.use("/api/deals", dealRoutes) // Added deals API route
app.use("/api/jobs", jobRoutes) // Added jobs API route
app.use("/api/events", eventRoutes) // Added events API route
app.use("/api/clubs", clubsRouter); // Added clubs API route
app.use("/api/users", userRoutes) // add user api route
app.use("/api/marketplace", marketplaceRoutes) // Added marketplace API route
app.use("/api/assignments", assignmentsRoutes) // add assignment API route
app.use("/api/badges", badgeRoutes) // Added badges API route

// catch 404 errors
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error handler:", err)

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large",
    })
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Unexpected file field",
    })
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  })
})

export default app
