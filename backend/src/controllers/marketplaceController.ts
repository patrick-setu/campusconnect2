import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse } from "@/types"
import { BadgeService } from "@/services/badgeService"

export class MarketplaceController {
  // GET marketplace posts
  static async getPosts(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const query = `
        SELECT 
          mp.*,
          u.name as creator_name
        FROM marketplace_posts mp
        JOIN users u ON mp.creator_id = u.id
        ORDER BY mp.created_at DESC
      `

      const result = await pool.query(query)

      res.json({
        success: true,
        message: "Marketplace posts retrieved successfully",
        data: {
          posts: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get marketplace posts error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // CREATE marketplace post
  static async createPost(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const creatorId = req.user!.id
      const { title, description, price, category, contact, image_url } = req.body

      const result = await pool.query(
        `INSERT INTO marketplace_posts (
          creator_id, title, description, price, category, contact, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [creatorId, title, description, price, category, contact, image_url]
      )

      const post = result.rows[0]

      // Check for new badges after creating marketplace post
      const newBadges = await BadgeService.checkAndAwardBadges(creatorId, 'marketplace');

      res.status(201).json({
        success: true,
        message: "Marketplace post created successfully",
        data: { post, newBadges },
      })
    } catch (error) {
      console.error("Create marketplace post error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // DELETE marketplace post
  static async deletePost(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Get post details
      const postResult = await pool.query(
        `SELECT mp.*, u.name as creator_name 
         FROM marketplace_posts mp 
         JOIN users u ON mp.creator_id = u.id 
         WHERE mp.id = $1`,
        [id]
      )

      if (postResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Marketplace post not found",
        })
        return
      }

      const post = postResult.rows[0]

      // Authorization (owner or admin only)
      if (post.creator_id !== userId && userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "You can only delete your own posts",
        })
        return
      }

      await pool.query("DELETE FROM marketplace_posts WHERE id = $1", [id])

      res.json({
        success: true,
        message: `Post "${post.title}" deleted successfully`,
      })
    } catch (error) {
      console.error("Delete marketplace post error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

}