import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/Dashboard.css';

const UserLayout = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: '🏠' },
    { name: 'Explore Clubs', path: '/user/clubs', icon: '🔍' },
    { name: 'My Events', path: '/user/events', icon: '📅' },
    { name: 'Profile', path: '/user/profile', icon: '👤' },
  ];

  return (
    <div className="dashboard-wrapper landing-body">
      {/* Sidebar */}
      <aside className="sidebar">
        <h4 className="text-info fw-bold mb-5 px-3">ClubHub</h4>
        <nav>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link-custom ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon} <span className="ms-2">{item.name}</span>
            </Link>
          ))}
          <hr className="text-secondary opacity-25 mt-4" />
          <Link to="/" className="nav-link-custom text-danger">🚪 Logout</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="d-flex justify-content-end mb-4">
          <div className="d-flex align-items-center bg-dark p-2 px-3 rounded-pill border border-secondary">
            <span className="text-white small me-2">Student Dashboard</span>
            <div className="bg-primary rounded-circle" style={{width: '30px', height: '30px'}}></div>
          </div>
        </header>
        
        {/* Sub-pages render here */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default UserLayout;