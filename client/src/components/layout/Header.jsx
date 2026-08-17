import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  FiMenu, FiPlus, FiMoon, FiSun, FiChevronDown, FiLogOut, FiSettings, FiLogIn, FiUserPlus
} from 'react-icons/fi';

const SECTION_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'templates', label: 'Templates' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
];

const getInitials = (name) =>
  (name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

const Header = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }
    const root = document.querySelector('.main-content');
    if (!root) return;
    const computeActive = () => {
      const rect = root.getBoundingClientRect();
      const headerH = root.querySelector('.top-header')?.offsetHeight || 0;
      const threshold = rect.top + headerH;
      let current = '';
      SECTION_LINKS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= threshold) current = id;
      });
      setActiveSection(current);
    };
    computeActive();
    root.addEventListener('scroll', computeActive, { passive: true });
    return () => root.removeEventListener('scroll', computeActive);
  }, [location.pathname]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <FiMenu />
        </button>
        <Link to="/" className="header-brand desktop-only" aria-label="InvoiceGen home">
          <div className="brand-icon">
            <img className="brand-logo-img" src="/invoice-logo.png" alt="InvoiceGen" />
          </div>
          <span>InvoiceGen</span>
        </Link>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
      </div>

      {location.pathname === '/' && (
        <nav className="header-nav-links desktop-only">
          {SECTION_LINKS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className={activeSection === id ? 'active' : ''} onClick={(e) => scrollToSection(e, id)}>
              {label}
            </a>
          ))}
        </nav>
      )}

      <div className="header-right">
        {user ? (
          <>
            <Link to="/invoices/create" className="btn btn-sm btn-primary">
              <FiPlus /> Create Invoice
            </Link>

            <div className="user-menu" ref={menuRef}>
              <button className="user-menu-trigger" onClick={() => setUserMenuOpen(o => !o)}>
                <span className="user-avatar">{getInitials(user?.name)}</span>
                <span className="user-info">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-email">{user?.email}</span>
                </span>
                <FiChevronDown className={`user-caret ${userMenuOpen ? 'rotate' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <Link to="/business-profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <FiSettings /> Business Profile
                  </Link>
                  <button className="dropdown-logout" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-md btn-outline">
              <FiLogIn /> Sign In
            </Link>
            <Link to="/signup" className="btn btn-md btn-primary">
              <FiUserPlus /> Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;