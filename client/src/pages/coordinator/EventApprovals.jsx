import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const EventApprovals = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingList, setPendingList] = useState([]);
  const [approvedList, setApprovedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const clubId = user?.clubId;

  const fetchData = async () => {
    if (!clubId) return;

    try {
      setLoading(true);

      const [pendingRes, approvedRes] = await Promise.all([
        API.get(`/events/club/${clubId}/pending`),
        API.get(`/events/club/${clubId}/approved`)
      ]);

      setPendingList(pendingRes.data);
      setApprovedList(approvedRes.data);

    } catch (err) {
      console.error("Error fetching approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clubId]);

  const handleAction = async (eventId, userId, action) => {
    setProcessingId(userId);

    try {
      if (action === 'approve') {
        await API.put(`/events/${eventId}/approve/${userId}`);
      } else {
        if (!window.confirm("Reject this student?")) {
          setProcessingId(null);
          return;
        }
        await API.put(`/events/${eventId}/reject/${userId}`);
      }

      fetchData(); // refresh both tabs

    } catch (err) {
      alert("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-info"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">

      <h2 className="text-white mb-3">Event Approvals</h2>

      {/* 🔥 TABS */}
      <div className="mb-4">
        <button
          className={`btn me-2 ${activeTab === "pending" ? "btn-info text-dark" : "btn-outline-info"}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>

        <button
          className={`btn ${activeTab === "approved" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setActiveTab("approved")}
        >
          Approved
        </button>
      </div>

      {/* ================= PENDING TAB ================= */}
      {activeTab === "pending" && (
        pendingList.length === 0 ? (
          <p className="text-secondary">No pending approvals</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((app, i) => (
                  <tr key={i}>
                    <td>{app.user.name}</td>
                    <td>{app.user.roll || "N/A"}</td>
                    <td>{app.eventName}</td>
                    <td>{new Date(app.eventDate).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => handleAction(app.eventId, app.user._id, 'reject')}
                        disabled={processingId === app.user._id}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-info btn-sm text-dark"
                        onClick={() => handleAction(app.eventId, app.user._id, 'approve')}
                        disabled={processingId === app.user._id}
                      >
                        {processingId === app.user._id ? "..." : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ================= APPROVED TAB ================= */}
      {activeTab === "approved" && (
        approvedList.length === 0 ? (
          <p className="text-secondary">No approved students</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll</th>
                  <th>Event</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {approvedList.map((app, i) => (
                  <tr key={i}>
                    <td>{app.user.name}</td>
                    <td>{app.user.roll || "N/A"}</td>
                    <td>{app.eventName}</td>
                    <td>{new Date(app.eventDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

    </div>
  );
};

export default EventApprovals;