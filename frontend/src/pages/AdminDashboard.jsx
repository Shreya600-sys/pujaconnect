import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const badgeClass = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pandits, setPandits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [categoryError, setCategoryError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [statsRes, panditsRes, bookingsRes, categoriesRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users", { params: { role: "pandit" } }),
      api.get("/admin/bookings"),
      api.get("/categories", { params: { all: true } }),
    ]);
    setStats(statsRes.data);
    setPandits(panditsRes.data.users);
    setBookings(bookingsRes.data.bookings);
    setCategories(categoriesRes.data.categories);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleVerify = async (id) => {
    await api.put(`/admin/users/${id}/verify-pandit`);
    fetchAll();
  };

  const toggleActive = async (id) => {
    await api.put(`/admin/users/${id}/toggle-active`);
    fetchAll();
  };

  const createCategory = async (e) => {
    e.preventDefault();
    setCategoryError("");
    try {
      await api.post("/categories", newCategory);
      setNewCategory({ name: "", description: "" });
      fetchAll();
    } catch (err) {
      setCategoryError(err.response?.data?.message || "Could not create category.");
    }
  };

  const toggleCategory = async (id) => {
    await api.put(`/categories/${id}/toggle`);
    fetchAll();
  };

  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    fetchAll();
  };

  const tabs = [
    ["overview", "Overview"],
    ["pandits", "Manage Pandits"],
    ["bookings", "All Bookings"],
    ["categories", "Puja Categories"],
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-side">
        <h2>Admin Panel</h2>
        <div className="who">Logged in as {user?.name}</div>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            className={`admin-tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </aside>

      <section className="admin-main">
        <h1 style={{ fontSize: 30 }}>{tabs.find(([k]) => k === tab)?.[1]}</h1>
        <p className="muted" style={{ marginBottom: 26 }}>Admin Dashboard</p>

        {loading && <p className="page-state">Loading…</p>}

        {!loading && tab === "overview" && stats && (
          <div className="stat-grid">
            <StatCard label="Total Customers" value={stats.totalCustomers} />
            <StatCard label="Total Pandits" value={stats.totalPandits} />
            <StatCard label="Total Bookings" value={stats.totalBookings} />
            <StatCard label="Pending Bookings" value={stats.pendingBookings} />
            <StatCard label="Confirmed Bookings" value={stats.confirmedBookings} />
            <StatCard label="Completed Bookings" value={stats.completedBookings} />
            <StatCard label="Total Revenue" value={`₹${stats.totalRevenue}`} highlight />
          </div>
        )}

        {!loading && tab === "pandits" && (
          <div className="stack" style={{ gap: 14 }}>
            {pandits.map((p) => (
              <div key={p._id} className="booking-row">
                <div className="avatar">{p.name?.[0]?.toUpperCase()}</div>
                <div className="booking-info">
                  <h3>{p.name}</h3>
                  <p>{p.email} · {p.city || "no city set"}</p>
                </div>
                <div className="booking-actions">
                  {p.isVerified && <span className="badge badge-confirmed">Verified</span>}
                  {!p.isActive && <span className="badge badge-cancelled">Deactivated</span>}
                  <button className="btn btn-outline btn-sm" onClick={() => toggleVerify(p._id)}>
                    {p.isVerified ? "Unverify" : "Verify"}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleActive(p._id)}>
                    {p.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
            {pandits.length === 0 && <div className="empty-state">No pandits registered yet.</div>}
          </div>
        )}

        {!loading && tab === "bookings" && (
          <div className="stack" style={{ gap: 14 }}>
            {bookings.map((b) => (
              <div key={b._id} className="booking-row">
                <div className="booking-info">
                  <h3>{b.poojaType}</h3>
                  <p>
                    Customer: {b.customer?.name} · Pandit: {b.pandit?.name} · {new Date(b.date).toLocaleDateString()} at {b.time}
                  </p>
                </div>
                <span className={`badge ${badgeClass[b.status]}`}>{b.status}</span>
              </div>
            ))}
            {bookings.length === 0 && <div className="empty-state">No bookings on the platform yet.</div>}
          </div>
        )}

        {!loading && tab === "categories" && (
          <div>
            <form onSubmit={createCategory} className="card admin-form">
              <div className="field" style={{ flex: "1 1 200px" }}>
                <label htmlFor="catName">Category name</label>
                <input
                  id="catName"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Griha Pravesh"
                />
              </div>
              <div className="field" style={{ flex: "2 1 280px" }}>
                <label htmlFor="catDesc">Description (optional)</label>
                <input
                  id="catDesc"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Short description of the ritual"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Add Category</button>
            </form>
            {categoryError && <p className="error-text">{categoryError}</p>}

            <div className="stack" style={{ gap: 12 }}>
              {categories.map((c) => (
                <div key={c._id} className="booking-row">
                  <div className="booking-info">
                    <h3>{c.name}</h3>
                    {c.description && <p>{c.description}</p>}
                  </div>
                  <div className="booking-actions">
                    <span className={`badge ${c.isActive ? "badge-confirmed" : "badge-cancelled"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleCategory(c._id)}>
                      {c.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button className="btn btn-danger-outline btn-sm" onClick={() => deleteCategory(c._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <div className="empty-state">No categories added yet. Add the first one above.</div>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
