const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/Users");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin user
    const adminUser = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      phoneNumber: "000-000-0000",
      password: hashedPassword,
      role: "admin" // Add role field
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();