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

  // update an assignment if owned by user
  static async updateAssignment(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const { course_code, title, details, due_date } = req.body as {
        course_code?: string
        title?: string
        details?: string
        due_date?: string
      }

      // find assignment
      const found = await pool.query(`SELECT * FROM assignments WHERE id = $1 AND user_id = $2`, [id, userId])
      if (found.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Assignment not found or unauthorized' })
        return
      }

      // nothing to update
      if (
        typeof course_code === 'undefined' &&
        typeof title === 'undefined' &&
        typeof details === 'undefined' &&
        typeof due_date === 'undefined'
      ) {
        res.status(400).json({ success: false, message: 'No fields to update' })
        return
      }

      // make update query
      const fields: string[] = []
      const values: any[] = []
      let idx = 1
      if (typeof course_code !== 'undefined') { fields.push(`course_code = $${idx++}`); values.push(course_code || null) }
      if (typeof title !== 'undefined') { fields.push(`title = $${idx++}`); values.push(title) }
      if (typeof details !== 'undefined') { fields.push(`details = $${idx++}`); values.push(details || null) }
      if (typeof due_date !== 'undefined') { fields.push(`due_date = $${idx++}`); values.push(due_date) }

      // add id  
      values.push(id, userId)
      const sql = `UPDATE assignments SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`

      const result = await pool.query(sql, values)
      res.json({ success: true, message: 'Assignment updated', data: { assignment: result.rows[0] } })
    } catch (error) {
      console.error('Update assignment error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }

  // delete an assignment if it is owned by user
  static async deleteAssignment(req: AuthenticatedRequest, res: Response<ApiResponse>) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      // check if assignment exists and belongs to user
      const checkResult = await pool.query(
        `SELECT * FROM assignments WHERE id = $1 AND user_id = $2`,
        [id, userId],
      )

      if (checkResult.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Assignment not found or unauthorized' })
        return
      }

      // delete the assignment
      await pool.query(`DELETE FROM assignments WHERE id = $1`, [id])

      res.json({ success: true, message: 'Assignment deleted' })
    } catch (error) {
      console.error('Delete assignment error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}

export default AssignmentController
