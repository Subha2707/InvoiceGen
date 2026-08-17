import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  FiMenu, FiPlus, FiMoon, FiSun, FiChevronDown, FiLogOut, FiSettings
} from 'react-icons/fi';

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

  return (
    <header className="top-header">
      <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <FiMenu />
      </button>

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
            <Link to="/login" className="btn btn-sm btn-outline">Sign In</Link>
            <Link to="/signup" className="btn btn-sm btn-primary">Get Started</Link>
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