import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface Service {
  name: string;
  duration: number;
  price: number;
  _id: string;
}

interface Booking {
  _id: string;
  userID: User | string; // Could be populated user object or just ID string
  services: Service[] | string[]; // Could be array of service objects or service IDs
  date: string;
  status?: string;
  user?: User; // For populated user data
  service?: Service; // For single service (if your data structure is different)
}

export function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const response = await fetch("http://localhost:5000/admin/bookings", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else if (response.status === 403) {
        toast.error("Access denied - Admin privileges required");
        // Redirect to regular user page
        window.location.href = "/";
      } else if (response.status === 401) {
        toast.error("Please log in to access this page");
        window.location.href = "/login";
      } else {
        toast.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Error fetching bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBooking(bookingId: string) {
    try {
      const response = await fetch(`http://localhost:5000/bookings/delete/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Booking deleted successfully");
        // Refresh the bookings list
        fetchBookings();
      } else {
        toast.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Error deleting booking");
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Helper function to get user display name
  const getUserDisplayName = (booking: Booking) => {
    if (typeof booking.userID === 'object' && booking.userID !== null) {
      return `${booking.userID.firstName} ${booking.userID.lastName}`;
    }
    // If userID is just a string ID, try to use the populated user field
    if (booking.user) {
      return `${booking.user.firstName} ${booking.user.lastName}`;
    }
    return "Unknown User";
  };

  // Helper function to get user email
  const getUserEmail = (booking: Booking) => {
    if (typeof booking.userID === 'object' && booking.userID !== null) {
      return booking.userID.email;
    }
    if (booking.user) {
      return booking.user.email;
    }
    return "Unknown Email";
  };

  // Helper function to get service names
  const getServiceNames = (booking: Booking) => {
    if (booking.services.length === 0) return "No services";
    
    if (typeof booking.services[0] === 'object') {
      return (booking.services as Service[]).map(service => service.name).join(", ");
    }
    return "Service IDs: " + (booking.services as string[]).join(", ");
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard - Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <h3>Booking #{booking._id.slice(-6)}</h3>
              <p><strong>User:</strong> {getUserDisplayName(booking)}</p>
              <p><strong>Email:</strong> {getUserEmail(booking)}</p>
              <p><strong>Services:</strong> {getServiceNames(booking)}</p>
              <p><strong>Date:</strong> {formatDate(booking.date)}</p>
              <p><strong>Status:</strong> {booking.status || "Confirmed"}</p>
              
              <div className="booking-actions">
                <button 
                  onClick={() => deleteBooking(booking._id)}
                  className="delete-btn"
                >
                  Delete Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}