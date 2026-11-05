import express from "express";
import { getStats, getUsers, toggleUserActive, verifyPandit, getAllBookings } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.put("/users/:id/toggle-active", toggleUserActive);
router.put("/users/:id/verify-pandit", verifyPandit);
router.get("/bookings", getAllBookings);

export default router;
