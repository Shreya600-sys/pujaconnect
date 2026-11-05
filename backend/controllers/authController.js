import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, poojaTypes, city, experience, bio, pricePerPooja, languages } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const userData = {
      name,
      email,
      password,
      phone,
      role: role === "pandit" ? "pandit" : "customer", // admin can never self-register
    };

    if (role === "pandit") {
      Object.assign(userData, {
        poojaTypes: poojaTypes || [],
        city,
        experience: experience || 0,
        bio,
        pricePerPooja: pricePerPooja || 0,
        languages: languages || [],
      });
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Contact support." });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// @route GET /api/auth/me
// This is the endpoint the frontend calls right after login / on every app load
// to get the FRESH, real-time logged-in user (name, role, profile, etc.)
export const getMe = async (req, res) => {
  // req.user is already the fresh document, set by the `protect` middleware
  return res.status(200).json({ user: req.user.toSafeObject() });
};

// @route PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name", "phone", "poojaTypes", "city", "address", "bio",
      "pricePerPooja", "languages", "experience", "profileImage",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });

    const updatedUser = await req.user.save();

    return res.status(200).json({ user: updatedUser.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};
