import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PanditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pandit, setPandit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/pandits/${id}`);
        setPandit(data.pandit);
      } catch (err) {
        setError(err.response?.data?.message || "Pandit not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="page-state">Loading profile…</p>;
  if (error) return <p className="error-text page-state">{error}</p>;
  if (!pandit) return null;

  return (
    <div className="container page">
      <div className="profile-layout">
        <div>
          <div className="card profile-hero">
            <div className="avatar avatar-lg">{pandit.name?.[0]?.toUpperCase()}</div>
            <div className="grow">
              <h1>
                {pandit.name}{" "}
                {pandit.isVerified && <span className="badge badge-confirmed">✓ Verified</span>}
              </h1>
              <p className="muted" style={{ margin: 0 }}>📍 {pandit.city} · {pandit.experience} yrs experience</p>
              <p className="rating" style={{ margin: "6px 0 0" }}>
                ★ {pandit.averageRating > 0 ? pandit.averageRating : "New"} ({pandit.reviews?.length || 0} reviews)
              </p>
            </div>
          </div>

          {pandit.bio && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 className="card-title">About</h3>
              <p className="muted" style={{ margin: 0 }}>{pandit.bio}</p>
            </div>
          )}

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 className="card-title">Poojas performed</h3>
            <div className="tag-list">
              {(pandit.poojaTypes || []).map((p) => (
                <span key={p} className="tag">{p}</span>
              ))}
            </div>
            {pandit.languages?.length > 0 && (
              <>
                <h3 className="card-title" style={{ marginTop: 22 }}>Languages spoken</h3>
                <div className="tag-list">
                  {pandit.languages.map((l) => (
                    <span key={l} className="tag">{l}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card">
            <h3 className="card-title">Reviews</h3>
            {(!pandit.reviews || pandit.reviews.length === 0) && (
              <p className="muted" style={{ margin: 0 }}>No reviews yet. Be the first to book and review.</p>
            )}
            {pandit.reviews?.slice().reverse().map((r) => (
              <div key={r._id} className="review">
                <div className="row-between">
                  <strong>{r.customerName}</strong>
                  <span className="rating">★ {r.rating}</span>
                </div>
                {r.comment && <p className="muted" style={{ margin: "6px 0 0", fontSize: 14 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>

        <aside className="card side-card">
          <span className="eyebrow">Starting at</span>
          <p className="side-price">{pandit.pricePerPooja > 0 ? `₹${pandit.pricePerPooja}` : "Price on request"}</p>
          {user?.role === "customer" && (
            <button className="btn btn-primary btn-block" onClick={() => navigate(`/book/${pandit._id}`)}>
              Book Now
            </button>
          )}
          {!user && (
            <button className="btn btn-primary btn-block" onClick={() => navigate("/login", { state: { from: `/book/${pandit._id}` } })}>
              Log in to Book
            </button>
          )}
          {user && user.role !== "customer" && (
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>Only customer accounts can book a pandit.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
