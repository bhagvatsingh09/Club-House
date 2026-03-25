import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (userId) fetchMyEvents();
  }, [userId]);

  const fetchMyEvents = async () => {
    try {
      const res = await API.get(`/events/user/${userId}`);
      setEvents(res.data);
    } catch (err) {
      toast.error("Failed to load your events.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel your registration?")) return;
    
    try {
      await API.put(`/events/${eventId}/cancel/${userId}`);
      toast.success("Registration cancelled");
      // Remove from local state
      setEvents(events.filter(e => e._id !== eventId));
    } catch (err) {
      toast.error("Cancellation failed.");
    }
  };

  // Logic to separate Upcoming (future date) and Past (older date)
  const filteredEvents = events.filter(event => {
    const isPast = new Date(event.date) < new Date();
    return activeTab === 'upcoming' ? !isPast : isPast;
  });

  if (loading) return <div className="text-center p-5 mt-5"><div className="spinner-border text-info"></div></div>;

  return (
    <>
      <div className="mb-5 mt-4">
        <h2 className="fw-bolder text-white">My Events</h2>
        <p className="text-secondary opacity-75">Track your club event registrations and schedules.</p>
      </div>

      <div className="d-flex mb-4 pb-3 border-bottom border-dark">
        {[
          { id: 'upcoming', label: 'Registered' },
          { id: 'past', label: 'History' }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`btn btn-sm px-4 py-2 me-2 rounded-pill fw-semibold transition ${activeTab === tab.id ? 'btn-info text-dark shadow-sm' : 'btn-dark border-secondary opacity-75'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="row g-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => {
            const isApproved = event.participants.includes(userId);
            const eventDate = new Date(event.date);
            
            return (
              <div className="col-12" key={event._id}>
                <div className="card shadow-lg p-3 rounded-4" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
                  <div className="row align-items-center">
                    
                    {/* Date Box */}
                    <div className="col-auto">
                      <div className="rounded-3 p-2 text-center border" style={{ width: '85px', background: 'rgba(255, 255, 255, 0.03)', borderColor: '#1a203c' }}>
                        <span className="d-block fw-bolder text-info fs-3">{eventDate.getDate()}</span>
                        <span className="text-secondary x-small text-uppercase fw-semibold">
                          {eventDate.toLocaleString('default', { month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="col ms-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {isApproved ? (
                          <span className="badge bg-success bg-opacity-25 text-success x-small">APPROVED</span>
                        ) : (
                          <span className="badge bg-warning bg-opacity-25 text-warning x-small">WAITING APPROVAL</span>
                        )}
                        <span className="text-info fw-bold small">@{event.club?.name || 'Club'}</span>
                      </div>
                      <h5 className="text-white fw-bolder mb-1">{event.title}</h5>
                      <div className="d-flex flex-wrap gap-3 text-secondary small opacity-75">
                        <span>🕒 {event.time || 'TBA'}</span>
                        <span>📍 {event.location || 'Campus'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-md-auto mt-3 mt-md-0 text-md-end">
                      {activeTab === 'upcoming' ? (
                        <div className="d-flex gap-2 justify-content-end">
                          <button 
                            className="btn btn-outline-danger btn-sm px-3 rounded-pill"
                            onClick={() => handleCancel(event._id)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-outline-secondary btn-sm px-4 rounded-pill" disabled={!isApproved}>
                          Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-5">
            <h6 className="text-secondary opacity-50">No events found in this section.</h6>
          </div>
        )}
      </div>
    </>
  );
};

export default MyEvents;