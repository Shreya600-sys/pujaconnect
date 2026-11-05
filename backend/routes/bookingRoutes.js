import express from "express";
import { createBooking, getMyBookings, updateBookingStatus } from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("customer"), createBooking);
router.get("/my", protect, getMyBookings);
router.put("/:id/status", protect, updateBookingStatus);

export default router;
