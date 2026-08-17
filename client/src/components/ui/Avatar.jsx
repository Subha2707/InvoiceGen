import React from 'react';

const getInitials = (name = '') =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w[0] || '').toUpperCase())
    .join('');

const Avatar = ({ name, size = 32, className = '' }) => (
  <span
    className={`avatar ${className}`}
    style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.38)) }}
  >
    {getInitials(name)}
  </span>
);

export default Avatar;