import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import PanditCard from "../components/PanditCard";

export default function Pandits() {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ city: "", poojaType: "", search: "", sort: "", language: "", minExperience: "" });

  const fetchPandits = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get("/pandits", { params });
      setPandits(data.pandits);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load pandits right now.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchPandits, 300); // debounce search typing
    return () => clearTimeout(timer);
  }, [fetchPandits]);

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Find your Pandit</h1>
        <p className="muted">Verified pandits, filtered by city, pooja type and rating.</p>
      </div>

      <div className="listing-layout">
        <aside className="card filters-panel">
          <h3 className="card-title">Filters</h3>
          <div className="field">
            <label>Search</label>
            <input
              placeholder="Search by name…"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="field">
            <label>City</label>
            <input
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Pooja type</label>
            <input
              placeholder="Pooja type"
              value={filters.poojaType}
              onChange={(e) => setFilters({ ...filters, poojaType: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Language</label>
            <input
              placeholder="Language"
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Experience</label>
            <input
              placeholder="Min. experience (yrs)"
              type="number"
              min="0"
              value={filters.minExperience}
              onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Sort</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="">Sort by</option>
              <option value="rating">Top rated</option>
              <option value="price">Lowest price</option>
            </select>
          </div>
        </aside>

        <section>
          {loading && <p className="page-state">Loading pandits…</p>}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && pandits.length === 0 && (
            <div className="empty-state">No pandits match your filters yet. Try broadening your search.</div>
          )}

          {!loading && pandits.length > 0 && (
            <>
              <p className="results-bar">{pandits.length} pandit{pandits.length === 1 ? "" : "s"} found</p>
              <div className="pandit-grid">
                {pandits.map((p) => (
                  <PanditCard key={p._id} pandit={p} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
