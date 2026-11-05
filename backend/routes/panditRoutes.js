import express from "express";
import { getPandits, getPanditById, addReview, addUnavailableDate, removeUnavailableDate } from "../controllers/panditController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getPandits);
router.get("/:id", getPanditById);
router.post("/:id/reviews", protect, authorize("customer"), addReview);
router.post("/availability", protect, authorize("pandit"), addUnavailableDate);
router.delete("/availability/:date", protect, authorize("pandit"), removeUnavailableDate);

export default router;
