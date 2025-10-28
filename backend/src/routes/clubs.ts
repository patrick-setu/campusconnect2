import { Router } from "express"
import { ClubController } from "@/controllers/clubController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createClubSchema } from "@/middleware/validation"
import { uploadClubMedia } from "@/middleware/upload"

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

// club posts 
router.get("/:id/posts", authenticateToken, ClubController.getClubPosts);
router.post("/:id/posts", authenticateToken, requireVerified, ClubController.createClubPost);
router.delete("/:id/posts/:postId", authenticateToken, ClubController.deleteClubPost);
router.post(
	"/:id/posts/media",
	authenticateToken,
	requireVerified,
	uploadClubMedia.array("media", 5),
	(req, res) => {
		// handle uploaded files
		const files = (req.files as Express.Multer.File[]) || [];
		const base = `${req.protocol}://${req.get('host')}`;
		const urls = files.map((f) => `${base}/uploads/club-events/${f.filename}`);
		res.json({ success: true, message: "Media uploaded", data: { urls } });
	}
);

export default router
