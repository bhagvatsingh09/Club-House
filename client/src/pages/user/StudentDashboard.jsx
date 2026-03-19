import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const StudentDashboard = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [dashboardData, setDashboardData] = useState({
    joinedClubs: [],
    registrations: [],
    announcements: []
  });
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchStudentData = async () => {
    // Check if user exists AND has an ID (check for both ._id and .id)
    const userId = user?._id || user?.id; 

    if (!userId) {
      console.warn("No User ID found, skipping fetch");
      setLoading(false);
      return;
    }

    try {
      const res = await API.get(`/students/dashboard/${userId}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error loading student dashboard:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchStudentData();
}, [user]);

  if (loading) return <div className="p-5 text-info text-center">Loading your profile...</div>;

  return (
    <>
      <div className="mb-5">
        <h2 className="fw-bold text-white">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
        <p className="text-secondary">Here's what's happening with your clubs today.</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Clubs and Status */}
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold text-info mb-0">Your Clubs</h5>
          </div>
          
          <div className="row g-3">
            {dashboardData.joinedClubs.length > 0 ? (
              dashboardData.joinedClubs.map(club => (
                <div className="col-md-6" key={club._id}>
                  <div className="card glass-input border-0 p-4 h-100 shadow-sm" style={{ backgroundColor: '#0a1128' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="mb-0 text-white">{club.name}</h5>
                      <span className="badge rounded-pill bg-success bg-opacity-10 text-success">Active</span>
                    </div>
                    <p className="text-secondary small mb-0">Role: Member</p>
                    <button className="btn btn-sm btn-outline-info mt-3 w-100">Visit Club</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12"><p className="text-secondary">You haven't joined any clubs yet.</p></div>
            )}
          </div>

          {/* Event Registrations Table */}
          <div className="mt-5">
            <h5 className="mb-4 fw-bold text-info">Recent Event Registrations</h5>
            <div className="table-responsive glass-input p-3 border-0 rounded-3" style={{ backgroundColor: '#0a1128' }}>
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr className="text-secondary border-secondary">
                    <th>Event Name</th>
                    <th>Club</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="border-0">
                  {dashboardData.registrations.map(reg => (
                    <tr key={reg._id}>
                      <td>{reg.eventId?.title}</td>
                      <td>{reg.clubId?.name}</td>
                      <td>
                        <span className={`badge bg-opacity-25 ${reg.status === 'approved' ? 'bg-success text-success' : 'bg-warning text-warning'}`}>
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Announcements */}
        <div className="col-lg-4">
          <h5 className="mb-4 fw-bold text-info">Announcements</h5>
          <div className="d-flex flex-column gap-3">
            {dashboardData.announcements.map(news => (
              <div className="card border-0 p-3 shadow-sm" key={news._id} style={{ backgroundColor: '#1a203c' }}>
                <h6 className="mb-1 text-white">{news.title}</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-info small fw-bold">{news.clubId?.name}</span>
                  <span className="text-secondary x-small">{new Date(news.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;