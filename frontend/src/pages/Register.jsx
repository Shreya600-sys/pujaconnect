import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const dashboardPath = (role) => (role === "pandit" ? "/pandit/dashboard" : "/dashboard");

const initialForm = {
  role: "customer",
  name: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  poojaTypes: "",
  languages: "",
  experience: "",
  pricePerPooja: "",
  bio: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
      };
      if (form.role === "pandit") {
        Object.assign(payload, {
          city: form.city,
          poojaTypes: form.poojaTypes.split(",").map((s) => s.trim()).filter(Boolean),
          languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
          experience: Number(form.experience) || 0,
          pricePerPooja: Number(form.pricePerPooja) || 0,
          bio: form.bio,
        });
      }
      const user = await register(payload);
      navigate(dashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <h2>Begin your<br />PujaConnect journey</h2>
        <p>Whether you need a pandit or you are one, getting started takes less than a minute.</p>
        <ul>
          <li>Verified, experienced pandits</li>
          <li>Simple date, time and location booking</li>
          <li>Transparent pricing and honest reviews</li>
        </ul>
      </aside>

      <section className="auth-panel">
        <div className="auth-form">
          <h1>Create your account</h1>
          <p className="muted">Choose how you'll use PujaConnect.</p>

          <div className="role-toggle">
            {["customer", "pandit"].map((r) => (
              <button
                key={r}
                type="button"
                className={form.role === r ? "active" : ""}
                onClick={() => setForm({ ...form, role: r })}
              >
                {r === "customer" ? "I need a Pandit" : "I am a Pandit"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Your full name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
            </div>

            {form.role === "pandit" && (
              <>
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" required value={form.city} onChange={handleChange} placeholder="e.g. Ahmedabad" />
                </div>
                <div className="field">
                  <label htmlFor="poojaTypes">Poojas you perform</label>
                  <input id="poojaTypes" name="poojaTypes" value={form.poojaTypes} onChange={handleChange} placeholder="Griha Pravesh, Satyanarayan Puja" />
                  <span className="field-hint">Separate with commas</span>
                </div>
                <div className="field">
                  <label htmlFor="languages">Languages you speak</label>
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
                  <label htmlFor="bio">Short bio</label>
                  <textarea id="bio" name="bio" rows={3} value={form.bio} onChange={handleChange} placeholder="Tell customers about your background" />
                </div>
              </>
            )}

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
