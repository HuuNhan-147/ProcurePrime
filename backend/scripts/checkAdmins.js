import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const admins = await User.find({ isAdmin: true }).lean();
  console.log("Existing admins count:", admins.length);

  for (const admin of admins) {
    console.log(`- Name: ${admin.name}, Email: ${admin.email}, Phone: ${admin.phone}, ID: ${admin._id}`);
  }

  // If no admin, or if we want to ensure a standard admin account exists
  const defaultAdminEmail = "admin@procureprime.vn";
  let standardAdmin = await User.findOne({ email: defaultAdminEmail });

  if (!standardAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@123456", 10);
    standardAdmin = await User.create({
      name: "Quản Trị Viên ProcurePrime",
      email: defaultAdminEmail,
      password: hashedPassword,
      phone: "0901234567",
      isAdmin: true,
    });
    console.log("Created standard admin:", defaultAdminEmail);
  } else {
    // Reset password to known password if needed
    const hashedPassword = await bcrypt.hash("Admin@123456", 10);
    standardAdmin.password = hashedPassword;
    standardAdmin.isAdmin = true;
    await standardAdmin.save();
    console.log("Updated standard admin password to: Admin@123456");
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

