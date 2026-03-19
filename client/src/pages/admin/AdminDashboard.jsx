import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClubs: 0,
    totalEvents: 0,
    totalRegistrations: 0
  });

  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/dashboard-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFaculty = async () => {
      try {
        const res = await API.get("/admin/faculty-coordinators");

        const updatedFaculty = res.data.map(f => ({
          ...f,
          isProtected: f.isProtected || false
        }));

        setFaculty(updatedFaculty);
      } catch (err) {
        console.error("Failed to load faculty coordinators", err);
      } finally {
        setFacultyLoading(false);
      }
    };

    fetchStats();
    fetchFaculty();
  }, []);

  const handleDelete = async (id, isProtected) => {
    if (isProtected) return;
    if (!window.confirm("Are you sure you want to delete this faculty coordinator?")) return;

    try {
      await API.delete(`/admin/faculty-coordinator/${id}`);
      setFaculty(faculty.filter(f => f._id !== id));
    } catch (err) {
      console.error("Failed to delete faculty coordinator", err);
    }
  };

  const handleChange = async (id, isProtected) => {
    if (isProtected) return;

    const newName = prompt("Enter new name for the faculty coordinator:");
    if (!newName) return;

    try {
      const res = await API.put(`/admin/faculty-coordinator/${id}`, { name: newName });
      setFaculty(faculty.map(f => (f._id === id ? res.data : f)));
    } catch (err) {
      console.error("Failed to update faculty coordinator", err);
    }
  };

  const globalStats = [
    { label: "Total Students", value: stats.totalStudents, icon: "🎓", color: "#5d78ff" },
    { label: "Active Clubs", value: stats.totalClubs, icon: "🏛️", color: "#48bb78" },
    { label: "Total Events", value: stats.totalEvents, icon: "🔥", color: "#f6ad55" },
    { label: "Total Registrations", value: stats.totalRegistrations, icon: "📝", color: "#ed64a6" }
  ];

  const handleCardClick = (label) => {
    if (label === "Total Students") {
      navigate("/admin/students");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-info"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid">

      {/* Header */}
      <div className="mb-5">
        <h2 className="fw-bold text-white">System Overview</h2>
        <p className="text-secondary">Global metrics and administrative control center.</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        {globalStats.map((stat, idx) => (
          <div
            className="col-md-3"
            key={idx}
            style={{ cursor: "pointer" }}
            onClick={() => handleCardClick(stat.label)}
          >
            <div
              className="card h-100 p-4 border-0 shadow-lg"
              style={{ backgroundColor: "#050a18", border: "1px solid #1a203c" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fs-2">{stat.icon}</span>
                <div style={{ width: "40px", height: "2px", background: stat.color }}></div>
              </div>

              <h3 className="fw-bolder text-white mb-1">{stat.value}</h3>

              <p
                className="text-secondary small fw-bold text-uppercase m-0"
                style={{ letterSpacing: "1px" }}
              >
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Approved Students Button */}
      <div className="mt-4">
        <button
          className="btn btn-info"
          onClick={() => navigate("/admin/approved-students")}
        >
          View Approved Students
        </button>
      </div>

      
    </div>
  );
};

export default AdminDashboard;