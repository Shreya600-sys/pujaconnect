import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const dashboardPath = (role) => {
  if (role === "pandit") return "/pandit/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from || dashboardPath(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <h2>Namaste 🙏<br />Welcome back</h2>
        <p>Log in to manage your puja bookings and stay connected with your pandit.</p>
        <ul>
          <li>Track every booking in one place</li>
          <li>Confirm, reschedule or cancel easily</li>
          <li>Review pandits after the ritual</li>
        </ul>
      </aside>

      <section className="auth-panel">
        <div className="auth-form">
          <h1>Log in</h1>
          <p className="muted">Enter your details to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : "Log In"}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
