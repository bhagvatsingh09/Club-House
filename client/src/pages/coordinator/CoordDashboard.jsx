import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import AnnounceEvent from './Announce';
import EventApprovals from './EventApprovals';
import GalleryManagement from './GalleryManagement';
import { useNavigate } from "react-router-dom";


const FacultyDashboard = () => {
  
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [clubName, setClubName] = useState("");
  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    gallery: 0,
    pendingApprovals: 0
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchDashboardData = async () => {
      try {

        if (!user?.clubId) return;

        const res = await API.get(`/club/${user.clubId}/stats`);

        setStats(res.data);
        setClubName(res.data.clubName);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

  }, [user?.clubId]);

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-info"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <header className="mb-5">

        <div className="d-flex justify-content-between align-items-center flex-wrap">

          <div>
            <h1 className="text-white fw-bold mb-1">
              {clubName || "Club Dashboard"}
            </h1>

            <p className="text-secondary mb-0">
              <span className="badge bg-info text-dark me-2">
                FACULTY PORTAL
              </span>
              Welcome back, {user?.name}
            </p>
           
          </div>

          {/* <div className="bg-dark p-1 mt-3 mt-md-0 rounded-pill border border-secondary">

            <TabBtn
              label="Overview"
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            />

            <TabBtn
              label="Event Approvals"
              active={activeTab === "approvals"}
              onClick={() => setActiveTab("approvals")}
            />

            <TabBtn
              label="Gallery"
              active={activeTab === "gallery"}
              onClick={() => setActiveTab("gallery")}
            />

          </div> */}
        </div>

        <hr className="border-secondary mt-4" />

      </header>

      {/* CONTENT */}
      <main>

        {activeTab === "overview" && (
          <div className="row g-4">

            <StatCard title="Active Members" value={stats.members} icon="👥" />
            <StatCard title="Total Events" value={stats.events} icon="📅" />
            <StatCard title="Gallery Items" value={stats.gallery} icon="📸" />
            <StatCard title="Pending Req." value={stats.pendingApprovals} icon="⏳" />

            <div className="col-12 mt-4">

              <h4 className="text-white fw-bold mb-4">
                Event Control Center
              </h4>

              <AnnounceEvent clubId={user?.clubId} />

            </div>

          </div>
        )}

        {activeTab === "approvals" && (
          <EventApprovals clubId={user?.clubId} />
        )}

        {activeTab === "gallery" && (
          <GalleryManagement clubId={user?.clubId} />
        )}

      </main>
    </div>
  );
};


const TabBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`btn btn-sm px-4 rounded-pill border-0 ${active ? "bg-info text-dark fw-bold" : "text-secondary"}`}
  >
    {label}
  </button>
);

const StatCard = ({ title, value, icon }) => (
  <div className="col-md-6 col-xl-3">

    <div className="card p-4 border-0 rounded-4 shadow-sm h-100 bg-dark">

      <div className="d-flex justify-content-between">

        <div>
          <h6 className="text-secondary text-uppercase">{title}</h6>
          <h2 className="text-white fw-bold">{value}</h2>
        </div>

        <div className="fs-4">
          {icon}
          
        </div>

      </div>

    </div>

  </div>
);

export default FacultyDashboard;