import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

// Shown only if the admin hasn't added any categories yet, so the page never looks empty.
const fallbackPoojaTypes = [
  { name: "Griha Pravesh", description: "Housewarming ritual for a new beginning" },
  { name: "Satyanarayan Puja", description: "Devotion and gratitude, any auspicious day" },
  { name: "Vivah Sanskar", description: "Wedding ceremonies with full Vedic rites" },
  { name: "Navratri Puja", description: "Nine nights of worship to Goddess Durga" },
];

const steps = [
  ["Search", "Filter pandits by city, pooja type, and rating."],
  ["Book", "Pick your date, time and location in a few taps."],
  ["Perform", "Your pandit arrives prepared for the ritual."],
  ["Review", "Rate your experience to help the community."],
];

export default function Home() {
  const [poojaTypes, setPoojaTypes] = useState(fallbackPoojaTypes);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/categories");
        if (data.categories?.length > 0) {
          setPoojaTypes(data.categories.slice(0, 8));
        }
      } catch {
        // keep the fallback list if the request fails
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Online Pandit & Puja Booking</span>
            <h1>Book a trusted Pandit, for <em>every sacred moment</em></h1>
            <p className="hero-lead">
              PujaConnect brings verified, experienced pandits to your doorstep — from a quiet
              morning Satyanarayan Puja to a full Vivah ceremony.
            </p>
            <div className="hero-actions">
              <Link to="/pandits" className="btn btn-primary">Find a Pandit</Link>
              <Link to="/register" className="btn btn-outline">Join as a Pandit</Link>
            </div>
            <div className="hero-trust">
              <div><strong>Verified</strong>pandits only</div>
              <div><strong>Easy</strong>date & time booking</div>
              <div><strong>Rated</strong>by real families</div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="mandala" />
            <div className="float-card one">✓ Pandit confirmed</div>
            <div className="float-card two">★ Top rated</div>
          </div>
        </div>
      </section>

      {/* Pooja types — pulled live from Admin > Puja Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Poojas people book most</h2>
            <p className="muted">Every pandit on PujaConnect lists exactly which rituals they perform.</p>
          </div>
          <div className="cat-grid">
            {poojaTypes.map((p, i) => (
              <div key={p.name} className="cat-card">
                <span className="cat-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>How it works</h2>
          </div>
          <div className="steps">
            {steps.map(([title, desc]) => (
              <div key={title} className="step">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Ready to plan your next puja?</h2>
              <p>Find a verified pandit near you in minutes.</p>
            </div>
            <Link to="/pandits" className="btn btn-primary">Browse Pandits</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
