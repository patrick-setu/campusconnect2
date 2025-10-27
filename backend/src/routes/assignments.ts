import express from 'express'
import AssignmentController from '@/controllers/assignmentController'
import { authenticateToken, requireVerified } from '@/middleware/auth'

const router = express.Router()

// all assignment routes require authentication
router.get('/', authenticateToken, AssignmentController.getAssignments)
router.post('/', authenticateToken, requireVerified, AssignmentController.createAssignment) // create assignment
router.put('/:id', authenticateToken, requireVerified, AssignmentController.updateAssignment) // edit assignment
router.delete('/:id', authenticateToken, AssignmentController.deleteAssignment) // delete assignment

export default router
