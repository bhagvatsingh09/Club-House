import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const CoordLayout = () => {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', path: '/coord/dashboard', icon: '📊' },
    { name: 'Announce Event', path: '/coord/announce', icon: '📢' },
    { name: 'Member Management', path: '/coord/members', icon: '👥' },
    { name: 'Event Approvals', path: '/coord/approvals', icon: '✅' },
    { name: 'Club Gallery', path: '/coord/gallery', icon: '🖼️' },
    { name: 'Student Registrations', path: '/coord/dashboard/student-approvals', icon: '🎓' },
  ];

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <h4 className="text-info fw-bold mb-5 px-3">CoordHub</h4>
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
          <div className="d-flex align-items-center bg-dark p-2 px-3 rounded-pill border border-secondary">
            <span className="text-info small fw-bold me-2">Club Admin</span>
            <div className="bg-info rounded-circle" style={{width: '30px', height: '30px'}}></div>
          </div>
        </header>
        <Outlet /> 
      </main>
    </div>
  );
};

export default CoordLayout;