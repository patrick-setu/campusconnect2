import { Router } from "express"
import { MarketplaceController } from "@/controllers/marketplaceController"
import { authenticateToken } from "@/middleware/auth"
import { validate, createMarketplacePostSchema } from "@/middleware/validation"

const router = Router()

router.get("/", MarketplaceController.getPosts)
router.post("/", authenticateToken, validate(createMarketplacePostSchema), MarketplaceController.createPost)
router.delete("/:id", authenticateToken, MarketplaceController.deletePost)

export default router