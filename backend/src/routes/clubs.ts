import { Router } from "express"
import { ClubController } from "@/controllers/clubController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createClubSchema } from "@/middleware/validation"

const router = Router()

// Get all clubs
router.get("/", ClubController.getClubs)

// Get a single club by ID
router.get("/:id", ClubController.getClub);

// Create a club (requires login + verified user)
router.post("/", authenticateToken, requireVerified, validate(createClubSchema), ClubController.createClub)

// Delete a club
router.delete("/:id", authenticateToken, ClubController.deleteClub)

// Apply to a club
router.post("/apply/:id", authenticateToken, ClubController.applyToClub);

// Get pending applications for a club (admin/creator only)
router.get("/:id/applications", authenticateToken, ClubController.getClubApplications);

// Accept/deny application
router.post("/:id/applications/:appId", authenticateToken, ClubController.handleClubApplication);

// get club members
router.get("/:id/members", authenticateToken, ClubController.getClubMembers);

export default router
