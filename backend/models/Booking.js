import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pandit: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    poojaType: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "10:30 AM"
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, trim: true },
    },
    notes: { type: String, trim: true, maxlength: 500 },
    price: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ pandit: 1, date: 1 });
bookingSchema.index({ customer: 1 });

export default mongoose.model("Booking", bookingSchema);
