import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PanditProfileEdit() {
  const { user, updateUserLocally, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    city: user?.city || "",
    address: user?.address || "",
    bio: user?.bio || "",
    poojaTypes: (user?.poojaTypes || []).join(", "),
    experience: user?.experience || 0,
    pricePerPooja: user?.pricePerPooja || 0,
    languages: (user?.languages || []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [newDate, setNewDate] = useState("");
  const [availError, setAvailError] = useState("");
  const [unavailableDates, setUnavailableDates] = useState(user?.unavailableDates || []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const payload = {
        ...form,
        experience: Number(form.experience) || 0,
        pricePerPooja: Number(form.pricePerPooja) || 0,
        poojaTypes: form.poojaTypes.split(",").map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.put("/auth/profile", payload);
      updateUserLocally(data.user);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addBlockedDate = async (e) => {
    e.preventDefault();
    setAvailError("");
    if (!newDate) return;
    try {
      const { data } = await api.post("/pandits/availability", { date: newDate });
      setUnavailableDates(data.unavailableDates);
      setNewDate("");
    } catch (err) {
      setAvailError(err.response?.data?.message || "Could not block this date.");
    }
  };

  const removeBlockedDate = async (date) => {
    const isoDate = new Date(date).toISOString().split("T")[0];
    const { data } = await api.delete(`/pandits/availability/${isoDate}`);
    setUnavailableDates(data.unavailableDates);
  };

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Edit Your Profile</h1>
        <p className="muted">Keep your details up to date so customers see accurate information.</p>
      </div>

      <div className="profile-layout" style={{ gridTemplateColumns: "1fr 380px" }}>
        <form onSubmit={handleSubmit} className="card">
          <h3 className="card-title">Profile details</h3>
          <div className="field-row">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" required value={form.name} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" name="city" value={form.city} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="address">Base address (optional)</label>
              <input id="address" name="address" value={form.address} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="poojaTypes">Poojas you perform</label>
            <input id="poojaTypes" name="poojaTypes" value={form.poojaTypes} onChange={handleChange} placeholder="Griha Pravesh, Satyanarayan Puja" />
            <span className="field-hint">Separate with commas</span>
          </div>
          <div className="field">
            <label htmlFor="languages">Languages spoken</label>
            <input id="languages" name="languages" value={form.languages} onChange={handleChange} placeholder="Hindi, Sanskrit, Gujarati" />
            <span className="field-hint">Separate with commas</span>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="experience">Experience (years)</label>
              <input id="experience" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="pricePerPooja">Starting price (₹)</label>
              <input id="pricePerPooja" name="pricePerPooja" type="number" min="0" value={form.pricePerPooja} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" rows={4} value={form.bio} onChange={handleChange} />
          </div>

          {error && <p className="error-text">{error}</p>}
          {saved && <p className="success-text">Profile updated successfully.</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? <span className="spinner" /> : "Save Changes"}
          </button>
        </form>

        <aside className="card" style={{ alignSelf: "start" }}>
          <h3 className="card-title">Availability Calendar</h3>
          <p className="muted" style={{ fontSize: 14 }}>
            Block dates you're unavailable — customers won't be able to book you on these days,
            and the platform automatically prevents double-booking any confirmed time slot.
          </p>

          <form onSubmit={addBlockedDate} className="row" style={{ flexWrap: "nowrap", marginBottom: 16 }}>
            <input
              type="date"
              className="input"
              value={newDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <button type="submit" className="btn btn-outline btn-sm">Block</button>
          </form>
          {availError && <p className="error-text">{availError}</p>}

          {unavailableDates.length === 0 ? (
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>No dates blocked — you're shown as available every day.</p>
          ) : (
            <div className="tag-list">
              {unavailableDates
                .slice()
                .sort((a, b) => new Date(a) - new Date(b))
                .map((d) => (
                  <span key={d} className="blocked-date">
                    {new Date(d).toLocaleDateString()}
                    <button onClick={() => removeBlockedDate(d)} aria-label="Unblock date">×</button>
                  </span>
                ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
