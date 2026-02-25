const rateLimit = require("express-rate-limit");

require("dotenv").config();
const connectDB = require("./db");
const express = require("express");

const cookieParser = require("cookie-parser");
const {
  registerUser,
  loginUser,
  getUser,
  logout,
  updateUser,
} = require("./controllers/userController");
const {
  selectService,
  createBooking,
  getBookings,
  selectDate,
  getUserBookings, 
  deleteBooking,
  getDate, 
} = require("./controllers/bookingControllers.js");
const {
  createService,
  getServices,
  getServiceByName,
  getServicesFromCookie,
  getServiceData, 
  deleteService,
} = require("./controllers/serviceController.js");
const cors = require("cors");

const { 
  getAllBookingsForAdmin,
}
=require("./controllers/bookingControllers.js");

const loginLimit = rateLimit({
  windowMs: 10000,
  max: 5,
  message: {
    error:
      "Whoa there, speedster! Give it a moment, when the bar’s gone, you can try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
app.use(express.json());
app.use(cookieParser("tempPassword"));
app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true, // allow cookies
  })
);

//Connecting to database
connectDB();

//Simple test route
app.get("/", (req, res) => {
  const ip = req.socket.remoteAddress;
  console.log(`${ip} Connected to backend`)
  res.send("API is running...");
  
});

//Register
app.post("/users/register", registerUser);

//Login
app.post("/users/login", loginLimit, loginUser);

//Logout
app.post("/users/logout", logout);

//Get user names from Cookie
app.get("/users", getUser);

app.put("/users", updateUser);

app.post("/bookings/select-services", selectService);
app.post("/bookings/select-date", selectDate);
app.post("/bookings", createBooking);
app.get("/bookings", getBookings);
app.get("/bookings/user", getUserBookings);
app.get("/bookings/getDate", getDate);
app.delete("/bookings/delete/:booking", deleteBooking);

app.post("/services", createService);

app.post("/services/data", getServiceData)

app.get("/services/cookie", getServicesFromCookie);

app.get("/services", getServices);

app.get("/services/:name", getServiceByName);

app.delete("/services/:id", deleteService);

app.get("/admin/bookings", getAllBookingsForAdmin);

//Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
