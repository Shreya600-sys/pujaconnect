import Category from "../models/Category.js";

// @route GET /api/categories  (public — used to power the ritual/category catalog)
export const getCategories = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ name: 1 });
    return res.status(200).json({ count: categories.length, categories });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

// @route POST /api/categories  (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const existing = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
    if (existing) return res.status(400).json({ message: "This category already exists" });

    const category = await Category.create({ name: name.trim(), description });
    return res.status(201).json({ category });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create category", error: error.message });
  }
};

// @route PUT /api/categories/:id/toggle  (admin only)
export const toggleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.isActive = !category.isActive;
    await category.save();
    return res.status(200).json({ category });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update category", error: error.message });
  }
};

// @route DELETE /api/categories/:id  (admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    return res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete category", error: error.message });
  }
};
