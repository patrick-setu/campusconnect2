import type { Request, Response } from "express"
import path from "path"
import fs from "fs"
import archiver from "archiver"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse, CreateNoteRequest } from "@/types"
import { BadgeService } from "@/services/badgeService"

export class NoteController {
  static async getNotes(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { course_code, type, search, approved } = req.query

      let query = `
        SELECT 
          n.*,
          u.name as uploader_name,
          c.name as course_name
        FROM notes n
        JOIN users u ON n.uploader_id = u.id
        JOIN courses c ON n.course_code = c.code
      `

      const conditions: string[] = []
      const values: any[] = []
      let paramCount = 0

      // conditions.push('n.approved = true');

      if (course_code) {
        paramCount++
        conditions.push(`n.course_code = $${paramCount}`)
        values.push(course_code)
      }

      if (type) {
        paramCount++
        conditions.push(`n.type = $${paramCount}`)
        values.push(type)
      }

      if (search) {
        paramCount++
        conditions.push(`(n.title ILIKE $${paramCount} OR n.description ILIKE $${paramCount})`)
        values.push(`%${search}%`)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }
      query += ` ORDER BY n.created_at DESC`

      const result = await pool.query(query, values)

      res.json({
        success: true,
        message: "Notes retrieved successfully",
        data: {
          notes: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get notes error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createNote(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { course_code, title, type, description } = req.body as CreateNoteRequest
      const file = req.file

      if (!file) {
        res.status(400).json({
          success: false,
          message: "File is required",
        })
        return
      }

      // Verify course exists
      const courseResult = await pool.query("SELECT code FROM courses WHERE code = $1", [course_code])
      if (courseResult.rows.length === 0) {
        // Clean up uploaded file
        fs.unlinkSync(file.path)
        res.status(400).json({
          success: false,
          message: "Invalid course code",
        })
        return
      }

      const result = await pool.query(
        `INSERT INTO notes (uploader_id, course_code, title, type, file_path, file_size, description, approved) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [userId, course_code, title, type, file.path, file.size, description, true],
      )

      const note = result.rows[0]

      // Check for new badges after uploading note
      const newBadges = await BadgeService.checkAndAwardBadges(userId, 'notes');

      res.status(201).json({
        success: true,
        message: "Note uploaded successfully and is now available to all students!",
        data: { note, newBadges },
      })
    } catch (error) {
      console.error("Create note error:", error)
      // Clean up uploaded file on error
      if (req.file) {
        fs.unlinkSync(req.file.path)
      }
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async downloadNote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const result = await pool.query("SELECT * FROM notes WHERE id = $1", [id])

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Note not found",
        })
        return
      }

      const note = result.rows[0]

      const absoluteFilePath = path.isAbsolute(note.file_path)
        ? note.file_path
        : path.resolve(process.cwd(), note.file_path)

      // Check if file exists
      if (!fs.existsSync(absoluteFilePath)) {
        console.error("File not found at path:", absoluteFilePath)
        res.status(404).json({
          success: false,
          message: "File not found on server",
        })
        return
      }

      // Increment download count
      await pool.query("UPDATE notes SET download_count = download_count + 1 WHERE id = $1", [id])

      const originalExtension = path.extname(note.file_path)
      const sanitizedTitle = note.title.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim()
      const originalFileName = `${sanitizedTitle}${originalExtension}`
      const zipFileName = `${sanitizedTitle}.zip`

      // Set headers for ZIP download
      res.setHeader("Content-Type", "application/zip")
      res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`)
      res.setHeader("Cache-Control", "no-cache")

      // Create ZIP archive
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Maximum compression
      })

      // Handle archive errors
      archive.on("error", (err) => {
        console.error("Archive error:", err)
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Failed to create ZIP file",
          })
        }
      })

      // Pipe archive to response
      archive.pipe(res)

      // Add the original file to the ZIP
      archive.file(absoluteFilePath, { name: originalFileName })

      // Finalize the archive
      await archive.finalize()
    } catch (error) {
      console.error("Download note error:", error)
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        })
      }
    }
  }

  static async getUserNotes(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id

      const result = await pool.query(
        `SELECT 
          n.*,
          c.name as course_name
        FROM notes n
        JOIN courses c ON n.course_code = c.code
        WHERE n.uploader_id = $1
        ORDER BY n.created_at DESC`,
        [userId],
      )

      res.json({
        success: true,
        message: "User notes retrieved successfully",
        data: {
          notes: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get user notes error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteNote(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Get note info
      const noteResult = await pool.query("SELECT * FROM notes WHERE id = $1", [id])

      if (noteResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Note not found",
        })
        return
      }

      const note = noteResult.rows[0]

      // Check if user can delete (admin or note owner)
      if (userRole !== "admin" && note.uploader_id !== userId) {
        res.status(403).json({
          success: false,
          message: "Not authorized to delete this note",
        })
        return
      }

      // Delete file from filesystem
      if (fs.existsSync(note.file_path)) {
        fs.unlinkSync(note.file_path)
      }

      // Delete note from database
      await pool.query("DELETE FROM notes WHERE id = $1", [id])

      res.json({
        success: true,
        message: "Note deleted successfully",
      })
    } catch (error) {
      console.error("Delete note error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async getAllNotes(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userRole = req.user!.role

      if (userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required",
        })
        return
      }

      const result = await pool.query(
        `SELECT 
          n.*,
          u.name as uploader_name,
          c.name as course_name
        FROM notes n
        JOIN users u ON n.uploader_id = u.id
        JOIN courses c ON n.course_code = c.code
        ORDER BY n.created_at DESC`,
      )

      res.json({
        success: true,
        message: "All notes retrieved successfully",
        data: {
          notes: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get all notes error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  private static getContentType(extension: string): string | null {
    const contentTypes: { [key: string]: string } = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    return contentTypes[extension.toLowerCase()] || null
  }
}
