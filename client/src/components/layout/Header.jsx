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
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

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
      <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <FiMenu />
      </button>

      {location.pathname === '/' && (
        <nav className="header-nav-links desktop-only">
          {SECTION_LINKS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} onClick={(e) => scrollToSection(e, id)}>
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
            <Link to="/login" className="btn btn-sm btn-outline">
              <FiLogIn /> Sign In
            </Link>
            <Link to="/signup" className="btn btn-sm btn-primary">
              <FiUserPlus /> Get Started
            </Link>
          </>
        )}

        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
      </div>
    </header>
  );
};

export default Header;