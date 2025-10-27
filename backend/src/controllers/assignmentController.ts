import type { Request, Response } from 'express'
import pool from '@/config/database'
import type { AuthenticatedRequest, ApiResponse } from '@/types'

export class AssignmentController {
  // get all assignments for user
  static async getAssignments(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const userId = req.user!.id

      const result = await pool.query(
        `SELECT a.* FROM assignments a WHERE a.user_id = $1 ORDER BY a.due_date ASC`,
        [userId],
      )

      res.json({
        success: true,
        message: 'Assignments retrieved successfully',
        data: { assignments: result.rows, total: result.rows.length },
      })
    } catch (error) {
      console.error('Get assignments error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }

  // create a new assignment linked to the logged in user
  static async createAssignment(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const userId = req.user!.id // owner of the assignment
      const { course_code, title, details, due_date } = req.body as {
        course_code?: string
        title: string
        details?: string
        due_date: string
      }

      if (!title || !due_date) {
        res.status(400).json({ success: false, message: 'Title and due date are required' })
        return
      }

      const result = await pool.query(
        // insert into database and return the created row
        `INSERT INTO assignments (user_id, course_code, title, details, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, course_code || null, title, details || null, due_date],
      )

      res.status(201).json({ success: true, message: 'Assignment created', data: { assignment: result.rows[0] } })
    } catch (error) {
      console.error('Create assignment error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export default AssignmentController
