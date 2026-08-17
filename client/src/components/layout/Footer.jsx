import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedinIn, FaInstagram, FaFacebookF } from 'react-icons/fa';

const SOCIAL_LINKS = [
  { icon: <FaGithub />, label: 'GitHub', href: 'https://github.com/' },
  { icon: <FaLinkedinIn />, label: 'LinkedIn', href: 'https://linkedin.com/' },
  { icon: <FaInstagram />, label: 'Instagram', href: 'https://instagram.com/' },
  { icon: <FaFacebookF />, label: 'Facebook', href: 'https://facebook.com/' },
];

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="landing-brand">
            <div className="brand-icon">
              <img className="brand-logo-img" src="/invoice-logo.png" alt="InvoiceGen" />
            </div>
            <span>InvoiceGen</span>
          </Link>
          <p>Effortless, GST-compliant invoicing for freelancers, agencies, and businesses.</p>
          <div className="footer-social">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-links">
          <div>
            <h5>Product</h5>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/invoices">Invoices</Link>
            <Link to="/clients">Clients</Link>
            <Link to="/business-profile">Business Profile</Link>
          </div>
          <div>
            <h5>Account</h5>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Register</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div>
            <h5>Legal</h5>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom text-center">
        <p>© {new Date().getFullYear()} InvoiceGen. All rights reserved. Crafted with care.</p>
      </div>
    </footer>
  );
};

export default Footer;
