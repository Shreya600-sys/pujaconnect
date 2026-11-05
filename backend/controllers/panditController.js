import User from "../models/User.js";

// @route GET /api/pandits
// Supports ?city=&poojaType=&search=&sort=rating|price
export const getPandits = async (req, res) => {
  try {
    const { city, poojaType, search, sort, language, minExperience } = req.query;
    const filter = { role: "pandit", isActive: true };

    if (city) filter.city = new RegExp(city, "i");
    if (poojaType) filter.poojaTypes = new RegExp(poojaType, "i");
    if (search) filter.name = new RegExp(search, "i");
    if (language) filter.languages = new RegExp(language, "i");
    if (minExperience) filter.experience = { $gte: Number(minExperience) || 0 };

    let query = User.find(filter).select("-password -reviews");

    if (sort === "rating") query = query.sort({ averageRating: -1 });
    else if (sort === "price") query = query.sort({ pricePerPooja: 1 });
    else query = query.sort({ createdAt: -1 });

    const pandits = await query;
    return res.status(200).json({ count: pandits.length, pandits });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pandits", error: error.message });
  }
};

// @route GET /api/pandits/:id
export const getPanditById = async (req, res) => {
  try {
    const pandit = await User.findOne({ _id: req.params.id, role: "pandit" }).select("-password");
    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }
    return res.status(200).json({ pandit });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pandit", error: error.message });
  }
};

// @route POST /api/pandits/availability  (pandit only) — mark a date as unavailable
export const addUnavailableDate = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const targetDate = new Date(date);
    const alreadyBlocked = req.user.unavailableDates.some(
      (d) => new Date(d).toDateString() === targetDate.toDateString()
    );
    if (alreadyBlocked) {
      return res.status(400).json({ message: "This date is already marked unavailable" });
    }

    req.user.unavailableDates.push(targetDate);
    await req.user.save();

    return res.status(200).json({ unavailableDates: req.user.unavailableDates });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update availability", error: error.message });
  }
};

// @route DELETE /api/pandits/availability/:date  (pandit only) — unblock a date
export const removeUnavailableDate = async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    req.user.unavailableDates = req.user.unavailableDates.filter(
      (d) => new Date(d).toDateString() !== targetDate.toDateString()
    );
    await req.user.save();

    return res.status(200).json({ unavailableDates: req.user.unavailableDates });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update availability", error: error.message });
  }
};
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const pandit = await User.findOne({ _id: req.params.id, role: "pandit" });
    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }

    const alreadyReviewed = pandit.reviews.find((r) => r.customer.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this pandit" });
    }

    pandit.reviews.push({
      customer: req.user._id,
      customerName: req.user.name,
      rating,
      comment,
    });
    pandit.recalculateRating();
    await pandit.save();

    return res.status(201).json({ message: "Review added", averageRating: pandit.averageRating });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add review", error: error.message });
  }
};
