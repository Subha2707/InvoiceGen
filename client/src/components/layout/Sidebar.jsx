import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiFileText, FiUsers, FiSettings, FiX, FiLogOut } from 'react-icons/fi';

const Sidebar = ({ isOpen, toggle }) => {
  const { logout } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="landing-brand" onClick={toggle}>
          <div className="brand-icon">
            <img className="brand-logo-img" src="/invoice-logo.png" alt="InvoiceGen" />
          </div>
          <span>InvoiceGen</span>
        </NavLink>
        <button className="close-btn" onClick={toggle}><FiX /></button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end onClick={toggle}>
          <FiHome /> Dashboard
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
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <FiLogOut /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
