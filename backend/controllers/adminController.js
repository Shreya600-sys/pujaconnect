import User from "../models/User.js";
import Booking from "../models/Booking.js";

// @route GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const [totalCustomers, totalPandits, totalBookings, pendingBookings, confirmedBookings, completedBookings] =
      await Promise.all([
        User.countDocuments({ role: "customer" }),
        User.countDocuments({ role: "pandit" }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: "pending" }),
        Booking.countDocuments({ status: "confirmed" }),
        Booking.countDocuments({ status: "completed" }),
      ]);

    const revenueAgg = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    return res.status(200).json({
      totalCustomers,
      totalPandits,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

// @route GET /api/admin/users?role=
export const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("-password -reviews").sort({ createdAt: -1 });
    return res.status(200).json({ count: users.length, users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// @route PUT /api/admin/users/:id/toggle-active
export const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({ user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

// @route PUT /api/admin/users/:id/verify-pandit
export const verifyPandit = async (req, res) => {
  try {
    const pandit = await User.findOne({ _id: req.params.id, role: "pandit" });
    if (!pandit) return res.status(404).json({ message: "Pandit not found" });

    pandit.isVerified = !pandit.isVerified;
    await pandit.save();

    return res.status(200).json({ pandit: pandit.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify pandit", error: error.message });
  }
};

// @route GET /api/admin/bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("pandit", "name city")
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });
    return res.status(200).json({ count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};
