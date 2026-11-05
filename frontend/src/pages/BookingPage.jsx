import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function BookingPage() {
  const { panditId } = useParams();
  const navigate = useNavigate();
  const [pandit, setPandit] = useState(null);
  const [form, setForm] = useState({
    poojaType: "",
    date: "",
    time: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/pandits/${panditId}`);
      setPandit(data.pandit);
      setForm((f) => ({ ...f, poojaType: data.pandit.poojaTypes?.[0] || "" }));
    })();
  }, [panditId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        panditId,
        poojaType: form.poojaType,
        date: form.date,
        time: form.time,
        location: { address: form.address, city: form.city, pincode: form.pincode },
        notes: form.notes,
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!pandit) return <p className="page-state">Loading…</p>;

  if (success) {
    return (
      <div className="container success-box">
        <span className="big">🪔</span>
        <h2>Booking request sent!</h2>
        <p className="muted">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="booking-layout">
        <aside className="card summary-card">
          <span className="eyebrow">Booking with</span>
          <h2>{pandit.name}</h2>
          <p>📍 {pandit.city}</p>
          <p>{pandit.experience} yrs experience</p>
          <div className="price-big">
            {pandit.pricePerPooja > 0 ? `₹${pandit.pricePerPooja}` : "On request"}
          </div>
          <p>starting price</p>
        </aside>

        <form onSubmit={handleSubmit} className="card">
          <h1 style={{ fontSize: 26 }}>Book {pandit.name}</h1>
          <p className="muted">
            {pandit.city} · Starting at {pandit.pricePerPooja > 0 ? `₹${pandit.pricePerPooja}` : "price on request"}
          </p>

          <div className="field">
            <label htmlFor="poojaType">Pooja type</label>
            <select id="poojaType" name="poojaType" required value={form.poojaType} onChange={handleChange}>
              {(pandit.poojaTypes || []).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" name="date" type="date" required min={new Date().toISOString().split("T")[0]} value={form.date} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="time">Time</label>
              <input id="time" name="time" type="time" required value={form.time} onChange={handleChange} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" required value={form.address} onChange={handleChange} placeholder="House no, street, area" />
          </div>

          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label htmlFor="city">City</label>
              <input id="city" name="city" required value={form.city} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="pincode">Pincode</label>
              <input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="notes">Notes for the pandit (optional)</label>
            <textarea id="notes" name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="Any special requirements" />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <span className="spinner" /> : "Confirm Booking Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
