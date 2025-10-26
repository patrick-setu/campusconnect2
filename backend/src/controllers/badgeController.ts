import type { Request, Response } from "express"
import pool from "@/config/database"
import { BadgeService } from "@/services/badgeService";
import type { AuthenticatedRequest, ApiResponse } from "@/types"

export class BadgeController {
  // Get user's badge progress for popup modal
  static async getBadgeProgress(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { userId } = req.params as { userId: string }

      // Check if user has public profile or if it's their own profile or admin
      if (req.user!.id !== userId && req.user!.role !== 'admin') {
        // Check if the profile is public
        const profileRes = await pool.query(
          "SELECT is_public FROM user_profiles WHERE user_id = $1",
          [userId]
        )
        
        if (profileRes.rows.length === 0 || !profileRes.rows[0].is_public) {
          res.status(403).json({ success: false, message: "Profile is private" })
          return
        }
      }

      const progress = await BadgeService.getUserBadgeProgress(userId)

      res.json({
        success: true,
        message: "Badge progress fetched",
        data: { progress },
      })
    } catch (err: any) {
      console.error("getBadgeProgress error:", err)
      res.status(500).json({ success: false, message: "Internal server error" })
    }
  }

  // Get user's earned badges
  static async getUserBadges(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { userId } = req.params as { userId: string }

      // Check if user has public profile or if it's their own profile or admin
      if (req.user!.id !== userId && req.user!.role !== 'admin') {
        // Check if the profile is public
        const profileRes = await pool.query(
          "SELECT is_public FROM user_profiles WHERE user_id = $1",
          [userId]
        )
        
        if (profileRes.rows.length === 0 || !profileRes.rows[0].is_public) {
          res.status(403).json({ success: false, message: "Profile is private" })
          return
        }
      }

      const badges = await BadgeService.getUserBadges(userId)

      res.json({
        success: true,
        message: "User badges fetched",
        data: { badges },
      })
    } catch (err: any) {
      console.error("getUserBadges error:", err)
      res.status(500).json({ success: false, message: "Internal server error" })
    }
  }
}


