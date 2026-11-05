import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const badgeClass = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await api.get("/bookings/my");
    setBookings(data.bookings);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancelBooking = async (id) => {
    await api.put(`/bookings/${id}/status`, { status: "cancelled" });
    fetchBookings();
  };

  return (
    <div>
      <section className="dash-head">
        <div className="container row-between">
          <div>
            {/* This greeting is the real-time proof: `user.name` comes live from AuthContext */}
            <h1>Namaste, {user?.name} 🙏</h1>
            <p className="muted" style={{ margin: 0 }}>Here are your puja bookings.</p>
          </div>
          <Link to="/pandits" className="btn btn-primary">+ Book a new Pooja</Link>
        </div>
      </section>

      <div className="container page" style={{ paddingTop: 30 }}>
        {loading && <p className="page-state">Loading bookings…</p>}

        {!loading && bookings.length === 0 && (
          <div className="empty-state">You haven't booked a pooja yet. Find a pandit to get started.</div>
        )}

        <div className="stack">
          {bookings.map((b) => {
            const d = new Date(b.date);
            return (
              <div key={b._id} className="booking-row">
                <div className="date-block">
                  <div className="d">{d.getDate()}</div>
                  <div className="m">{d.toLocaleString("en", { month: "short" })}</div>
                </div>
                <div className="booking-info">
                  <h3>{b.poojaType}</h3>
                  <p>with {b.pandit?.name} · {d.toLocaleDateString()} at {b.time}</p>
                  <p>{b.location?.address}, {b.location?.city}</p>
                </div>
                <div className="booking-actions">
                  <span className={`badge ${badgeClass[b.status]}`}>{b.status}</span>
                  {["pending", "confirmed"].includes(b.status) && (
                    <button className="btn btn-danger-outline btn-sm" onClick={() => cancelBooking(b._id)}>Cancel</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
