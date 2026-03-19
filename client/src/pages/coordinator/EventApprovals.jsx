import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const EventApprovals = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // To disable buttons while processing

  const user = JSON.parse(localStorage.getItem('user'));
  const clubId = user?.clubId;

  const fetchPendingApprovals = async () => {
    if (!clubId) return;
    try {
      const res = await API.get(`/events/club/${clubId}/pending`);
      setPendingList(res.data);
    } catch (err) {
      console.error("Failed to fetch pending approvals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, [clubId]);

  const handleAction = async (eventId, userId, action) => {
    setProcessingId(userId); // Show loading state on the specific row
    try {
      if (action === 'approve') {
        await API.put(`/events/${eventId}/approve/${userId}`);
      } else if (action === 'reject') {
        if (!window.confirm("Are you sure you want to reject this application?")) {
          setProcessingId(null);
          return;
        }
        await API.put(`/events/${eventId}/reject/${userId}`);
      }
      // Remove the processed user from the UI immediately without requiring a full refetch
      setPendingList(prev => prev.filter(item => item.user._id !== userId || item.eventId !== eventId));
    } catch (err) {
      alert(`Failed to ${action} student. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-5">
        <h2 className="fw-bold text-white">Event Approvals</h2>
        <p className="text-secondary">Review and approve student registrations for upcoming events.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
        </div>
      ) : pendingList.length > 0 ? (
        <div className="table-responsive shadow-lg rounded-4 p-3" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
          <table className="table table-dark table-hover align-middle mb-0 border-0">
            <thead>
              <tr className="text-secondary small border-bottom border-dark">
                <th className="bg-transparent">STUDENT NAME</th>
                <th className="bg-transparent">ROLL NUMBER</th>
                <th className="bg-transparent">EVENT</th>
                <th className="bg-transparent">EVENT DATE</th>
                <th className="text-end bg-transparent">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map((app, index) => (
                <tr key={`${app.eventId}-${app.user._id}-${index}`} className="border-bottom border-dark border-opacity-50">
                  <td className="fw-bold text-white bg-transparent">
                    {app.user.name}
                    <div className="text-secondary d-md-none small">{app.user.roll}</div>
                  </td>
                  <td className="text-secondary bg-transparent d-none d-md-table-cell">
                    {app.user.roll || 'N/A'}
                  </td>
                  <td className="bg-transparent">
                    <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">
                      {app.eventName}
                    </span>
                  </td>
                  <td className="text-secondary small bg-transparent">
                    {new Date(app.eventDate).toLocaleDateString()}
                  </td>
                  <td className="text-end bg-transparent">
                    <button 
                      className="btn btn-sm btn-outline-danger me-2 rounded-pill px-3 fw-bold"
                      onClick={() => handleAction(app.eventId, app.user._id, 'reject')}
                      disabled={processingId === app.user._id}
                    >
                      Reject
                    </button>
                    <button 
                      className="btn btn-sm btn-info rounded-pill px-3 text-dark fw-bold"
                      onClick={() => handleAction(app.eventId, app.user._id, 'approve')}
                      disabled={processingId === app.user._id}
                    >
                      {processingId === app.user._id ? 'Processing...' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card border-0 rounded-4 p-5 text-center shadow" style={{ backgroundColor: '#0a1128', border: '1px solid #1a203c' }}>
          <div className="display-4 mb-3 opacity-50">🎉</div>
          <h4 className="text-white fw-bold">All Caught Up!</h4>
          <p className="text-secondary mb-0">There are no pending event approvals at this time.</p>
        </div>
      )}
    </div>
  );
};

export default EventApprovals;