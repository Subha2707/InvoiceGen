import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const LEGAL_LINKS = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/cookies', label: 'Cookie Policy' },
  { to: '/contact', label: 'Contact Us' },
];

const LegalLayout = ({ icon, title, subtitle, updated, children }) => (
  <div className="legal-page">
    <div className="legal-hero">
      <div className="legal-hero-inner">
        <div className="legal-hero-icon">{icon}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {updated && <span className="legal-updated-badge">Last updated: {updated}</span>}
      </div>
    </div>

    <div className="legal-nav">
      {LEGAL_LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) => (isActive ? 'legal-nav-link active' : 'legal-nav-link')}
        >
          {l.label}
        </NavLink>
      ))}
    </div>

    <div className="legal-container">
      <Link to="/" className="legal-back">← Back to Home</Link>
      {children}
    </div>
  </div>
);

export default LegalLayout;