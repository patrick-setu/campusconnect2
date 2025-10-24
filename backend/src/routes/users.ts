import { Router } from "express"
import { UserController } from "@/controllers/userController"
import { authenticateToken } from "@/middleware/auth"

const router = Router()

// profile routes need to be logged in 
router.get("/me", authenticateToken, UserController.getMyProfile) // get own profile
router.put("/me", authenticateToken, UserController.updateMyProfile) // update profile

// view someone elses profile
router.get("/:id", authenticateToken, UserController.getUserPublicProfile)

export default router
