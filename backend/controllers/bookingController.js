import Booking from "../models/Booking.js";
import User from "../models/User.js";

// @route POST /api/bookings  (customer only)
export const createBooking = async (req, res) => {
  try {
    const { panditId, poojaType, date, time, location, notes } = req.body;

    if (!panditId || !poojaType || !date || !time || !location?.address || !location?.city) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    const pandit = await User.findOne({ _id: panditId, role: "pandit" });
    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }

    const requestedDate = new Date(date);

    // Reliability requirement: prevent booking on a date the pandit has explicitly blocked
    const isBlocked = (pandit.unavailableDates || []).some(
      (d) => new Date(d).toDateString() === requestedDate.toDateString()
    );
    if (isBlocked) {
      return res.status(409).json({ message: "This pandit is unavailable on the selected date. Please choose another date." });
    }

    // Reliability requirement: prevent double-booking the same pandit for the same date & time
    const conflict = await Booking.findOne({
      pandit: pandit._id,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
      time,
      status: { $in: ["pending", "confirmed"] },
    });
    if (conflict) {
      return res.status(409).json({ message: "This time slot is already booked for this pandit. Please choose a different time." });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      pandit: pandit._id,
      poojaType,
      date,
      time,
      location,
      notes,
      price: pandit.pricePerPooja || 0,
    });

    pandit.totalBookings += 1;
    await pandit.save();

    const populated = await booking.populate([
      { path: "pandit", select: "name city poojaTypes pricePerPooja profileImage" },
      { path: "customer", select: "name phone" },
    ]);

    return res.status(201).json({ booking: populated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create booking", error: error.message });
  }
};

// @route GET /api/bookings/my  (customer -> their bookings, pandit -> bookings for them)
export const getMyBookings = async (req, res) => {
  try {
    const filter = req.user.role === "pandit" ? { pandit: req.user._id } : { customer: req.user._id };

    const bookings = await Booking.find(filter)
      .populate("pandit", "name city poojaTypes pricePerPooja profileImage")
      .populate("customer", "name phone")
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({ count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// @route PUT /api/bookings/:id/status  (pandit or admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwnerPandit = req.user.role === "pandit" && booking.pandit.toString() === req.user._id.toString();
    const isOwnerCustomer = req.user.role === "customer" && booking.customer.toString() === req.user._id.toString() && status === "cancelled";

    if (!isOwnerPandit && !isOwnerCustomer && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({ booking });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
};
