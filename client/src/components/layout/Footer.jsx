import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="app-footer-container">
        <div className="footer-left">
          <Link to="/dashboard" className="landing-brand">
            <div className="brand-icon">
              <img className="brand-logo-img" src="/invoice-logo.png" alt="InvoiceGen" />
            </div>
            <span>InvoiceGen</span>
          </Link>
          <p className="footer-tagline">Fast, GST-compliant invoicing platform for businesses.</p>
        </div>

        <div className="footer-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/invoices">Invoices</Link>
          <Link to="/clients">Clients</Link>
          <Link to="/business-profile">Business Profile</Link>
          <Link to="/invoices/create">Create Invoice</Link>
        </div>

        <div className="footer-copy">
          <p>© {new Date().getFullYear()} InvoiceGen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
