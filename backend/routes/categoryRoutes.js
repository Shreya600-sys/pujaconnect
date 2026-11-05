import express from "express";
import { getCategories, createCategory, toggleCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id/toggle", protect, authorize("admin"), toggleCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

export default router;
