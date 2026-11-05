import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["customer", "pandit", "admin"], default: "customer" },
    isActive: { type: Boolean, default: true },

    // --- Pandit-specific fields ---
    poojaTypes: [{ type: String, trim: true }],
    experience: { type: Number, default: 0 },
    city: { type: String, trim: true },
    address: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    pricePerPooja: { type: Number, default: 0 },
    languages: [{ type: String, trim: true }],
    profileImage: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    // Dates the pandit has explicitly marked as unavailable (leave, already booked elsewhere, etc.)
    unavailableDates: [{ type: Date }],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.recalculateRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    return;
  }
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
};

// Never send password out even if select isn't used
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
