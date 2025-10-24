import { Response } from "express"
import pool from "@/config/database"
import { AuthenticatedRequest, ApiResponse } from "@/types"

export class UserController {
  // get the logged in users profile info
  static async getMyProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id

      // grab user info from users table
      const userRes = await pool.query(
        "SELECT id, name, email, verified, role, created_at FROM users WHERE id = $1",
        [userId],
      )

      if (userRes.rows.length === 0) {
        res.status(404).json({ success: false, message: "User not found" })
        return
      }

      // check if extended profile info exists in table
      const profileRes = await pool.query(
        "SELECT display_name, profile_image_url, about, interests, current_courses, created_at, updated_at FROM user_profiles WHERE user_id = $1",
        [userId],
      )

      res.json({
        success: true,
        message: "Profile fetched",
        data: {
          user: userRes.rows[0],
          profile: profileRes.rows[0] || {
            display_name: null,
            profile_image_url: null,
            about: null,
            interests: [],
            current_courses: [],
          },
        },
      })
    } catch (err: any) {
      console.error("getMyProfile error:", err)
      res.status(500).json({ success: false, message: "Internal server error" })
    }
  }

  // update or create profile for user
  static async updateMyProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { display_name, profile_image_url, about, interests, current_courses } = req.body || {}

      // normalize arrays , allow comma separated strings 
      const normInterests = Array.isArray(interests)
        ? interests
        : typeof interests === "string" && interests.trim().length
          ? interests.split(",").map((s: string) => s.trim()).filter(Boolean)
          : []
      const normCourses = Array.isArray(current_courses)
        ? current_courses
        : typeof current_courses === "string" && current_courses.trim().length
          ? current_courses.split(",").map((s: string) => s.trim()).filter(Boolean)
          : []

      // upsert, update if exists, insert if not
      const upsertSql = `
        INSERT INTO user_profiles (user_id, display_name, profile_image_url, about, interests, current_courses)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id)
        DO UPDATE SET
          display_name = EXCLUDED.display_name,
          profile_image_url = EXCLUDED.profile_image_url,
          about = EXCLUDED.about,
          interests = EXCLUDED.interests,
          current_courses = EXCLUDED.current_courses,
          updated_at = CURRENT_TIMESTAMP
        RETURNING display_name, profile_image_url, about, interests, current_courses, created_at, updated_at;
      `

      const profRes = await pool.query(upsertSql, [
        userId,
        display_name ?? null,
        profile_image_url ?? null,
        about ?? null,
        normInterests.length ? normInterests : null,
        normCourses.length ? normCourses : null,
      ])

      res.json({
        success: true,
        message: "Profile updated",
        data: { profile: profRes.rows[0] },
      })
    } catch (err: any) {
      console.error("updateMyProfile error:", err)
      res.status(500).json({ success: false, message: "Internal server error" })
    }
  }

  // view other users profile dont show email
  static async getUserPublicProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params as { id: string }

      // get basic info 
      const userRes = await pool.query(
        "SELECT id, name, verified, role, created_at FROM users WHERE id = $1",
        [id],
      )
      if (userRes.rows.length === 0) {
        res.status(404).json({ success: false, message: "User not found" })
        return
      }
      const profileRes = await pool.query(
        "SELECT display_name, profile_image_url, about, interests, current_courses FROM user_profiles WHERE user_id = $1",
        [id],
      )
      res.json({
        success: true,
        message: "Public profile fetched",
        data: { user: userRes.rows[0], profile: profileRes.rows[0] || null },
      })
    } catch (err: any) {
      console.error("getUserPublicProfile error:", err)
      res.status(500).json({ success: false, message: "Internal server error" })
    }
  }
}
