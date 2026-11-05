import { Link } from "react-router-dom";

export default function PanditCard({ pandit }) {
  return (
    <article className="pandit-card">
      <div className="pc-banner" />
      <div className="pc-body">
        <div className="pc-head">
          <div className="avatar">{pandit.name?.[0]?.toUpperCase() || "P"}</div>
          {pandit.isVerified && <span className="badge badge-confirmed">✓ Verified</span>}
        </div>

        <div>
          <h3 className="pc-name">{pandit.name}</h3>
          <span className="pc-city">📍 {pandit.city || "City not set"}</span>
        </div>

        <div className="tag-list">
          {(pandit.poojaTypes || []).slice(0, 3).map((p) => (
            <span key={p} className="tag">{p}</span>
          ))}
        </div>

        <div className="pc-foot">
          <span className="rating">★ {pandit.averageRating > 0 ? pandit.averageRating : "New"}</span>
          <span className="price">{pandit.pricePerPooja > 0 ? `₹${pandit.pricePerPooja}+` : "Price on request"}</span>
        </div>

        <Link to={`/pandits/${pandit._id}`} className="btn btn-outline btn-sm btn-block">
          View Profile
        </Link>
      </div>
    </article>
  );
}
