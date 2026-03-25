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
      const userId = user?._id || user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(`/student/dashboard/${userId}`);
        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  if (loading)
    return <div className="text-center text-info mt-5">Loading...</div>;

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="mb-5">
        <h2 className="fw-bold text-white">
          Welcome back, {user?.name?.split(' ')[0] || "User"} 👋
        </h2>
        <p className="text-secondary">Here’s your activity overview</p>
      </div>

      <div className="row g-4">

        {/* LEFT SIDE */}
        <div className="col-lg-8">

          {/* CLUBS */}
          <div className="col-lg-8">
            <h5 className="text-info mb-3">Your Clubs</h5>

            <div className="d-flex flex-column gap-3">
              {dashboardData.joinedClubs.length > 0 ? (
                dashboardData.joinedClubs.map(club => (
                  <div
                    key={club._id}
                    className="card bg-dark text-white p-3 shadow-sm"
                    style={{
                      borderRadius: "12px",
                      transition: "0.3s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">

                      {/* LEFT SIDE */}
                      <div>
                        <h5 className="mb-1">{club.name}</h5>
                        <p className="text-secondary small mb-0">
                          Active Club Member
                        </p>
                      </div>

                      {/* RIGHT SIDE */}
                      <button className="btn btn-outline-info btn-sm">
                        View
                      </button>

                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary">No clubs joined</p>
              )}
            </div>
          </div>

          {/* REGISTRATIONS */}
          <div className="mt-5">
            <h5 className="text-info mb-3">Recent Registrations</h5>

            <div className="dash-card p-3">

              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr className="text-secondary">
                    <th>Event</th>
                    <th>Club</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData.registrations.length > 0 ? (
                    dashboardData.registrations.map(reg => (
                      <tr key={reg._id}>
                        <td>{reg.eventId?.title}</td>
                        <td>{reg.clubId?.name}</td>
                        <td>
                          <span className={`badge ${reg.status === "approved"
                              ? "bg-success"
                              : "bg-warning text-dark"
                            }`}>
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-secondary">
                        No registrations yet
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>

            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="col-lg-4">

          <h5 className="text-info mb-3">Announcements</h5>

          {dashboardData.announcements.length > 0 ? (
            dashboardData.announcements.map(news => (
              <div key={news._id} className="dash-card mb-3">

                <h6 className="text-white">{news.title}</h6>

                <div className="d-flex justify-content-between mt-2">
                  <span className="text-info small">
                    {news.club?.name}
                  </span>

                  <span className="text-secondary small">
                    {new Date(news.createdAt).toLocaleDateString()}
                  </span>
                </div>

              </div>
            ))
          ) : (
            <p className="text-secondary">No announcements</p>
          )}

        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;