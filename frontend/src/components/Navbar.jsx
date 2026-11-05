import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const dashboardPath = (role) => {
  if (role === "pandit") return "/pandit/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
};

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">🪔</span>
          <span>PujaConnect</span>
        </Link>

        <nav className="nav-links">
          <Link to="/pandits" className="nav-link">Find a Pandit</Link>

          {loading ? (
            <span className="nav-placeholder" />
          ) : user ? (
            <div className="user-menu">
              <button
                className="user-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <span className="avatar-sm">{initials(user.name) || "U"}</span>
                {/* Real-time name: comes straight from AuthContext's `user` */}
                <span className="user-name">{user.name}</span>
                <span className="role-tag">{user.role}</span>
              </button>

              {menuOpen && (
                <div className="dropdown">
                  <Link to={dashboardPath(user.role)} className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    My Dashboard
                  </Link>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
