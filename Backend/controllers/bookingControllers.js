const Booking = require("../models/Booking.js");
const Service = require("../models/Service.js");
const User = require("../models/Users");

async function selectService(req, res) {
    try {
        const services = req.body.services;

        if(!Array.isArray(services) || services.length == 0)
            return res.status(400).json({error: "Services must be a non empty array"});
        for(let i = 0; i < services.length; i++) {
            const exists = await Service.findById(services[i])
            if (!exists) {
                return res.status(401).json({ error: "Service not found" });
            }
        }

        res.cookie("services", JSON.stringify(services), {
            httpOnly: true,
            secure: false,        // must be false on localhost
            sameSite: "lax",      // "strict" can block cross-origin requests
            maxAge: 1000 * 60 * 60
        });

        res.status(201).json({ error: "Created new service" });

    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getBookings(req, res) {
    try {
        const bookings = await Booking.find({});
        const dates = [];
        bookings.forEach(booking => {
            dates.push(booking.date);
        });

        return res.status(200).json(dates);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function getUserBookings(req, res) {
    try {
        const UserID = req.cookies.user;
        if (!UserID) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const bookings = await Booking.find({ userID: UserID }).populate('services');
        
        return res.status(200).json(bookings);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function selectDate(req, res) {
    try {
        const dateString = req.body.date;
        if (!dateString)
            return res.status(400).json({ error: "Missing date" });

        const date = new Date(dateString);
        if (isNaN(date.getTime()))
            return res.status(400).json({ error: "Invalid date format" });
        const exists = await Booking.findOne({ date: date });
        if (exists)
            return res.status(400).json({ error: "Date already booked" });

        res.cookie("bookingDate", date.toISOString(), {
            httpOnly: true,
            secure: false,        // must be false on localhost
            sameSite: "lax",      // "strict" can block cross-origin requests
            maxAge: 1000 * 60 * 60
        });

        return res.status(201).json({ message: "Date cookie created" });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function getDate(req, res) {
    try {
        const cookie = req.cookies.bookingDate;
        if (!cookie) {
            return res.status(404).json({ error: "no date found" });
        }
        const date = cookie;
        res.status(200).json({ date: date });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function createBooking(req, res) {
    try {
        const services = req.cookies.services ? JSON.parse(req.cookies.services) : [];
        if (!Array.isArray(services) || services.length == 0)
            return res.status(400).json({ error: "Services must be a non empty array" });

        const UserID = req.cookies.user;
        if (!UserID)
            return res.status(404).json({ error: "User not found" });

        const dateString = req.cookies.bookingDate;
        if (!dateString)
            return res.status(400).json({ error: "Missing date" });


        const date = new Date(dateString);
        if (isNaN(date.getTime()))
            return res.status(400).json({ error: "Invalid date format" });
        const exist = await Booking.findOne({ userID: UserID, services: services, date: date });
        if (exist)
            return res.status(400).json({ error: "Booking already exists" })

        const newBooking = new Booking({
            userID: UserID,
            services: services,
            date: date
        });

        await newBooking.save();

        return res.status(201).json({ message: "Booking created" });

    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}
async function deleteBooking(req, res) {
    try {

        
        const bookingId = req.params.booking;

        if (!bookingId) {
            return res.status(400).json({ error: "Booking ID is required" });
        }

        const UserID = req.cookies.user;
        if (!UserID) {
            return res.status(401).json({ error: "User not authenticated " })
        }

        await Booking.findOneAndDelete({
            _id: bookingId,
            userID: UserID
        });

        return res.status(200).json({ message: "Booking deleted successfully" })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function getAllBookingsForAdmin(req, res) {
  try {
    const userID = req.cookies.user;

    if (!userID) return res.status(401).json({ error: "Not logged in" });

    const user = await User.findById(userID);

    if (!user || !user.isAdmin)
      return res.status(403).json({ error: "Access denied. Admins only." });

    // Fetch all bookings and populate related data
    const bookings = await Booking.find()
      .populate("userID", "firstName lastName email phoneNumber")
      .populate("services", "name price");

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//Add new to create temporary booking 
//Add new for time 
//Add new to confirm temporary bookings
//Add new for canceling temporary time
//Add to selectDate, if aktiv reservation exists, if nor make one

module.exports = { selectService, createBooking, getBookings, selectDate, getDate, deleteBooking, getUserBookings, getAllBookingsForAdmin };