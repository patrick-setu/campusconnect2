import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse } from "@/types"
import { sendEmail } from "@/services/emailService"
import { BadgeService } from "@/services/badgeService"

export class ClubController {
  // GET clubs
  static async getClubs(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { search, sort = "new", limit = "20", offset = "0" } = req.query
      const userId = (req as AuthenticatedRequest).user?.id

      let query = `
        SELECT 
          c.*,
          u.name as creator_name,
          COALESCE(member_counts.count, 0) as members_count
        FROM clubs c
        JOIN users u ON c.creator_id = u.id
        LEFT JOIN (
          SELECT club_id, COUNT(*) as count 
          FROM club_members 
          GROUP BY club_id
        ) member_counts ON c.id = member_counts.club_id
      `

      const conditions: string[] = ["c.is_active = true"]
      const values: any[] = []
      let paramCount = 0

      if (search) {
        paramCount++
        conditions.push(
          `(c.name ILIKE $${paramCount} OR c.description ILIKE $${paramCount} OR c.location ILIKE $${paramCount})`
        )
        values.push(`%${search}%`)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }

      // Sorting
      if (sort === "popular") {
        query += ` ORDER BY members_count DESC, c.created_at DESC`
      } else {
        query += ` ORDER BY c.created_at DESC`
      }

      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
      values.push(Number.parseInt(limit as string), Number.parseInt(offset as string))

      const result = await pool.query(query, values)

      res.json({
        success: true,
        message: "Clubs retrieved successfully",
        data: {
          clubs: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get clubs error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // UPDATE the createClub method in clubController.ts
  static async createClub(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const creatorId = req.user!.id
      const { name, description, location, club_date, club_time, image_url, join_link } = req.body

      const result = await pool.query(
        `INSERT INTO clubs (
        creator_id, name, description, location, club_date, club_time, image_url, join_link 
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
        [creatorId, name, description, location, club_date, club_time, image_url, join_link]
      )

      const club = result.rows[0]

      res.status(201).json({
        success: true,
        message: "Club created successfully",
        data: { club },
      })
    } catch (error) {
      console.error("Create club error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
  // DELETE club
  static async deleteClub(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Get club details
      const clubResult = await pool.query(
        `SELECT c.*, u.name as creator_name 
         FROM clubs c 
         JOIN users u ON c.creator_id = u.id 
         WHERE c.id = $1`,
        [id]
      )

      if (clubResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Club not found",
        })
        return
      }

      const club = clubResult.rows[0]

      // Authorization (owner or admin only)
      if (club.creator_id !== userId && userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "You can only delete your own clubs",
        })
        return
      }

      await pool.query("DELETE FROM clubs WHERE id = $1", [id])

      res.json({
        success: true,
        message: `Club "${club.name}" deleted successfully`,
      })
    } catch (error) {
      console.error("Delete club error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async getClub(req: Request, res: Response) {
    try {
      const clubId = req.params.id
      const result = await pool.query("SELECT * FROM clubs WHERE id = $1", [clubId])
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: "Club not found" })
        return
      }
      res.json({ 
        success: true, 
        message: "Club retrieved successfully",
        data: { 
          club: result.rows[0],
          members: [],
          posts: []
        } 
      })
      return
    } catch (error) {
      console.error("Get club error:", error)
      res.status(500).json({ success: false, message: "Internal server error" })
      return
    }
  }

  static async applyToClub(req: Request, res: Response) {
    try {
      const clubId = req.params.id;
      const { name, studentId, reason } = req.body;
      const userId = (req as AuthenticatedRequest).user!.id;

      // Fetch club and admin email
      const clubResult = await pool.query("SELECT * FROM clubs WHERE id = $1", [clubId]);
      if (clubResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Club not found" });
      }
      const club = clubResult.rows[0];

      // Fetch admin user
      const adminResult = await pool.query("SELECT email FROM users WHERE id = $1", [club.creator_id]);
      if (adminResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Club admin not found" });
      }
      const adminEmail = adminResult.rows[0].email;

      // Insert application into club_applications
      await pool.query(
        `INSERT INTO club_applications (club_id, user_id, name, student_id, reason, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')`,
        [clubId, userId, name, studentId, reason]
      );

      // Prepare email content
      const subject = `New Club Application for ${club.name}`;
      const text = `Applicant Name: ${name}\nStudent ID: ${studentId}\nReason: ${reason}`;
      const html = `
        <p><strong>Applicant Name:</strong> ${name}</p>
        <p><strong>Student ID:</strong> ${studentId}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      `;

      // Send email 
      await sendEmail(adminEmail, subject, text, html);

      return res.json({ success: true, message: "Application sent to club admin." });
    } catch (error) {
      console.error("Apply to club error:", error); // bug handling 
      return res.status(500).json({ success: false, message: "Failed to send application." });
    }
  }

  // Get all applications for a club (admin only)
  static async getClubApplications(req: AuthenticatedRequest, res: Response) {
    try {
      const clubId = req.params.id;
      const userId = req.user!.id;

      // Only club creator or admin can view
      const club = await pool.query("SELECT * FROM clubs WHERE id = $1", [clubId]);
      if (!club.rows.length || (club.rows[0].creator_id !== userId && req.user!.role !== "admin")) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const apps = await pool.query(
        `SELECT ca.*, u.email FROM club_applications ca JOIN users u ON ca.user_id = u.id WHERE ca.club_id = $1 AND ca.status = 'pending'`,
        [clubId]
      );
      return res.json({ success: true, applications: apps.rows });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch applications" });
    }
  }

  // Accept or deny application
  static async handleClubApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const { id, appId } = req.params;
      const { action } = req.body; // "accept" or "deny"
      const userId = req.user!.id;

      // Only club creator or admin can act
      const club = await pool.query("SELECT * FROM clubs WHERE id = $1", [id]);
      if (!club.rows.length || (club.rows[0].creator_id !== userId && req.user!.role !== "admin")) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const appRes = await pool.query("SELECT * FROM club_applications WHERE id = $1 AND club_id = $2", [appId, id]);
      if (!appRes.rows.length) return res.status(404).json({ success: false, message: "Application not found" });
      const application = appRes.rows[0];

      if (application.status !== "pending") {
        return res.status(400).json({ success: false, message: "Already processed" });
      }

      // Update status
      await pool.query("UPDATE club_applications SET status = $1 WHERE id = $2", [action, appId]);

      // Fetch applicant email
      const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [application.user_id]);
      const email = userRes.rows[0]?.email;

      if (action === "accept") {
        // Add to club_members
        await pool.query(
          "INSERT INTO club_members (club_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING",
          [id, application.user_id]
        );
        
        // Check for new badges after joining club
        const newBadges = await BadgeService.checkAndAwardBadges(application.user_id, 'clubs');
        
        // Email accepted
        await sendEmail(
          email,
          `Accepted to ${club.rows[0].name}`,
          `You have been accepted to the club "${club.rows[0].name}".`,
          `<p>You have been accepted to the club <b>${club.rows[0].name}</b>.</p>`
        );
      } else if (action === "deny") {
        // Email denied
        await sendEmail(
          email,
          `Application Denied for ${club.rows[0].name}`,
          `Your application to "${club.rows[0].name}" was denied.`,
          `<p>Your application to <b>${club.rows[0].name}</b> was denied.</p>`
        );
      }

      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to process application" });
    }
  }

  // get club members admin only
  // get all members of a club (admin/creator only)
  static async getClubMembers(req: AuthenticatedRequest, res: Response) {
    try {
      const clubId = req.params.id;
      const userId = req.user!.id;

      // check if club exists and user is admin
      const clubResult = await pool.query("SELECT * FROM clubs WHERE id = $1", [clubId]);
      if (!clubResult.rows.length) {
        return res.status(404).json({ success: false, message: "Club not found" });
      }

      const club = clubResult.rows[0];
      // use user id if creator id isnt found 
      const creatorIdField = club.creator_id !== undefined ? club.creator_id : club.user_id;
      if (creatorIdField !== userId && req.user!.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only club admins can view members" });
      }

      // fetch all members with their profile info
      const membersResult = await pool.query(
        `SELECT 
          cm.id as membership_id,
          cm.user_id,
          cm.role,
          cm.join_date,
          u.name,
          u.email,
          up.display_name,
          up.profile_image_url,
          up.about,
          up.interests,
          up.current_courses,
          up.is_public
        FROM club_members cm
        JOIN users u ON cm.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE cm.club_id = $1
        ORDER BY cm.join_date DESC`,
        [clubId]
      );

      return res.json({
        success: true,
        data: {
          members: membersResult.rows,
          total: membersResult.rows.length
        }
      });
    } catch (error) {
      console.error("Get club members error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch members" });
    }
  }
}
