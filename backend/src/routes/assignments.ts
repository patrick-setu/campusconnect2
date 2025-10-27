import express from 'express'
import AssignmentController from '@/controllers/assignmentController'
import { authenticateToken, requireVerified } from '@/middleware/auth'

const router = express.Router()

// all assignment routes require authentication
router.get('/', authenticateToken, AssignmentController.getAssignments)
router.post('/', authenticateToken, requireVerified, AssignmentController.createAssignment)

export default router
