// Run once with: node seedAdmin.js
// Creates a default admin account for testing the Admin Dashboard.
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const email = "admin@pujaconnect.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  await User.create({
    name: "PujaConnect Admin",
    email,
    password: "Admin@123",
    role: "admin",
  });

  console.log("Admin created:");
  console.log("  email:    admin@pujaconnect.com");
  console.log("  password: Admin@123");
  process.exit(0);
};

run();
