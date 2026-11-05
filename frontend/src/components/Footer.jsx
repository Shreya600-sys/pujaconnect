import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">🪔 PujaConnect</div>
            <p>Verified, experienced pandits for every sacred moment — booked in a few taps.</p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/pandits">Find a Pandit</Link>
            <Link to="/register">Join as a Pandit</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign Up</Link>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} PujaConnect. All rights reserved.</div>
      </div>
    </footer>
  );
}
