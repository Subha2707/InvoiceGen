import React from 'react';

const Loader = ({ label = 'Loading...' }) => (
  <div className="loader-container">
    <div className="loader-box">
      <div className="spinner"></div>
      {label && <span className="loader-label">{label}</span>}
    </div>
  </div>
);

export default Loader;
