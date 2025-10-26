import { Router } from "express"
import { authenticateToken } from "@/middleware/auth"
import { BadgeController } from "@/controllers/badgeController"

const router = Router()

router.get("/progress/:userId", authenticateToken, BadgeController.getBadgeProgress)
router.get("/user/:userId", authenticateToken, BadgeController.getUserBadges)

export default router