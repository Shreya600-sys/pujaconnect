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

const nextActions = {
  pending: [["confirmed", "Accept"], ["cancelled", "Decline"]],
  confirmed: [["completed", "Mark Completed"], ["cancelled", "Cancel"]],
  completed: [],
  cancelled: [],
};

export default function PanditDashboard() {
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

  const updateStatus = async (id, status) => {
    await api.put(`/bookings/${id}/status`, { status });
    fetchBookings();
  };

  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  return (
    <div>
      <section className="dash-head">
        <div className="container">
          <div className="row-between">
            {/* Real-time name from AuthContext, fetched fresh via /api/auth/me */}
            <h1 style={{ margin: 0 }}>Welcome, Pandit {user?.name} 🪔</h1>
            <Link to="/pandit/profile" className="btn btn-outline btn-sm">Edit Profile & Availability</Link>
          </div>
          <div className="chip-row">
            {user?.isVerified ? (
              <span className="badge badge-confirmed">✓ Verified profile</span>
            ) : (
              <span className="badge badge-pending">Verification pending</span>
            )}
            <span className="chip">★ {user?.averageRating || "New"}</span>
            <span className="chip">{user?.totalBookings || 0} total bookings</span>
          </div>
        </div>
      </section>

      <div className="container page" style={{ paddingTop: 10 }}>
        <h2 className="section-title">Upcoming requests</h2>
        {loading && <p className="page-state">Loading…</p>}
        {!loading && upcoming.length === 0 && <div className="empty-state">No upcoming bookings right now.</div>}

        <div className="stack" style={{ marginBottom: 20 }}>
          {upcoming.map((b) => {
            const d = new Date(b.date);
            return (
              <div key={b._id} className="booking-row">
                <div className="date-block">
                  <div className="d">{d.getDate()}</div>
                  <div className="m">{d.toLocaleString("en", { month: "short" })}</div>
                </div>
                <div className="booking-info">
                  <h3>{b.poojaType}</h3>
                  <p>for {b.customer?.name} ({b.customer?.phone || "no phone"}) · {d.toLocaleDateString()} at {b.time}</p>
                  <p>{b.location?.address}, {b.location?.city}</p>
                </div>
                <div className="booking-actions">
                  <span className={`badge ${badgeClass[b.status]}`}>{b.status}</span>
                  {nextActions[b.status].map(([status, label]) => (
                    <button key={status} className="btn btn-outline btn-sm" onClick={() => updateStatus(b._id, status)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {past.length > 0 && (
          <>
            <h2 className="section-title">History</h2>
            <div className="stack" style={{ gap: 12 }}>
              {past.map((b) => (
                <div key={b._id} className="booking-row compact">
                  <div className="booking-info">
                    <h3 style={{ margin: 0, fontSize: 16 }}>{b.poojaType} — {b.customer?.name}</h3>
                  </div>
                  <span className={`badge ${badgeClass[b.status]}`}>{b.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
