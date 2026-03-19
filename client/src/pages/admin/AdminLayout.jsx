import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();
  const menuItems = [
    { name: 'Global Overview', path: '/admin/dashboard', icon: '🌐' },
    { name: 'Club Management', path: '/admin/clubs', icon: '🏛️' },
    { name: 'Assign Tasks', path: '/admin/tasks', icon: '🎯' },
    { name: 'Global Gallery', path: '/admin/galleries', icon: '🖼️' },
    { name: 'User Logs', path: '/admin/logs', icon: '📜' },
  ];

  return (
    <div className="dashboard-wrapper landing-body">
      <aside className="sidebar">
        <h4 className="text-info fw-bold mb-5 px-3">AdminCentral</h4>
        <nav className="flex-grow-1">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} 
              className={`nav-link-custom ${location.pathname === item.path ? 'active' : ''}`}>
              {item.icon} <span className="ms-2">{item.name}</span>
            </Link>
          ))}
          <hr className="text-secondary opacity-25 mt-4" />
          <Link to="/" className="nav-link-custom text-danger">Logout</Link>
        </nav>
      </aside>
      <main className="main-content">
        <header className="d-flex justify-content-end mb-4">
          <div className="d-flex align-items-center bg-dark p-2 px-3 rounded-pill border border-danger border-opacity-50">
            <span className="text-danger small fw-bold me-2">System Admin</span>
            <div className="bg-danger rounded-circle" style={{width: '30px', height: '30px'}}></div>
          </div>
        </header>
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;