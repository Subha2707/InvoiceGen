import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-container">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content-area">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
