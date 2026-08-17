import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiGrid, FiFileText, FiUsers, FiSettings,
  FiShield, FiBookOpen, FiInfo, FiMail, FiX, FiLogOut
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggle }) => {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <NavLink to="/" className="landing-brand" onClick={toggle}>
          <div className="brand-icon">
            <img className="brand-logo-img" src="/invoice-logo.png" alt="InvoiceGen" />
          </div>
          <span>InvoiceGen</span>
        </NavLink>
        <button className="close-btn" onClick={toggle}><FiX /></button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end onClick={toggle}>
          <FiHome /> Home
        </NavLink>
        <NavLink to="/dashboard" end onClick={toggle}>
          <FiGrid /> Dashboard
        </NavLink>
        <NavLink to="/invoices" onClick={toggle}>
          <FiFileText /> Invoices
        </NavLink>
        <NavLink to="/clients" onClick={toggle}>
          <FiUsers /> Clients
        </NavLink>
        <NavLink to="/business-profile" onClick={toggle}>
          <FiSettings /> Business Profile
        </NavLink>

        <div className="nav-divider" />
        <span className="sidebar-section-label">Support</span>
        <NavLink to="/contact" onClick={toggle}>
          <FiMail /> Contact
        </NavLink>

        <div className="nav-divider" />
        <span className="sidebar-section-label">Legal</span>
        <NavLink to="/privacy" onClick={toggle}>
          <FiShield /> Privacy Policy
        </NavLink>
        <NavLink to="/terms" onClick={toggle}>
          <FiBookOpen /> Terms of Service
        </NavLink>
        <NavLink to="/cookies" onClick={toggle}>
          <FiInfo /> Cookie Policy
        </NavLink>
      </nav>

      {user && (
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <FiLogOut /> <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
