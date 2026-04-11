import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const AnnounceEvent = () => {
  const [view, setView] = useState('list');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const clubId = user?.clubId;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    capacity: 100,
    club: clubId
  });

  // Fetch events and club members
  const fetchData = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const [eventsRes, membersRes] = await Promise.all([
        API.get(`/events/club/${clubId}`),
        API.get(`/club/${clubId}/members`)
      ]);

      setEvents(eventsRes.data || []);
      setClubMembers(membersRes.data || []);

      // If managing an event, update selectedEvent with fresh data
      if (selectedEvent) {
        const updatedEvent = eventsRes.data.find(ev => ev._id === selectedEvent._id);
        if (updatedEvent) setSelectedEvent(updatedEvent);
      }
    } catch (err) {
      console.error("Data fetch failed", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CREATE or UPDATE event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await API.put(`/events/${selectedEvent._id}`, formData);
      } else {
        await API.post('/events/create', formData);
      }

      setView('list');
      setSelectedEvent(null);
      setFormData({ title: '', date: '', location: '', description: '', capacity: 100, club: clubId });

      fetchData();
    } catch (err) {
      alert("Action failed");
    }
  };

  // ASSIGN VOLUNTEER
  const assignVolunteer = async (userId) => {
    if (!userId || !selectedEvent) return;
    try {
      const res = await API.put(`/events/${selectedEvent._id}/assign-volunteer`, { userId });
      setSelectedEvent(res.data); // Update volunteers
      fetchData(); // Refresh events & members
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning volunteer");
    }
  };

  // EDIT EVENT
  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      date: event.date?.slice(0, 16),
      location: event.location,
      description: event.description,
      capacity: event.capacity,
      club: event.club
    });
    setSelectedEvent(event);
    setView('create');
  };

  // DELETE EVENT
  const handleDelete = async (eventId) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await API.delete(`/events/${eventId}`);
      if (selectedEvent?._id === eventId) setSelectedEvent(null);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };
  const removeVolunteer = async (userId) => {
  if (!userId || !selectedEvent) return;

  if (!window.confirm("Remove this volunteer from event?")) return;

  try {
    const res = await API.put(
      `/events/${selectedEvent._id}/remove-volunteer`,
      { userId }
    );

    setSelectedEvent(res.data); // ✅ instantly update UI
    fetchData(); // optional refresh

  } catch (err) {
    alert(err.response?.data?.message || "Error removing volunteer");
  }
};

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-dark pb-4">
        <div>
          <h2 className="fw-bold text-white">Event Control Center</h2>
          <p className="text-secondary mb-0">Manage registrations and logistics for your club events.</p>
        </div>
        {view === 'list' ? (
          <button className="btn btn-info px-4 rounded-pill fw-bold text-dark" onClick={() => setView('create')}>
            + Create New Event
          </button>
        ) : (
          <button className="btn btn-outline-light px-4 rounded-pill" onClick={() => setView('list')}>
            ← Back to List
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="row g-4">
          <div className="col-12">
            <div className="card shadow-lg border-0 rounded-4" style={{ backgroundColor: '#0a1128' }}>
              <div className="table-responsive p-3">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead className="text-secondary small">
                    <tr>
                      <th>EVENT TITLE</th>
                      <th>DATE</th>
                      <th>REGISTRATIONS</th>
                      <th>VOLUNTEERS</th>
                      <th className="text-end">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(ev => (
                      <tr key={ev._id}>
                        <td className="fw-bold text-info">{ev.title}</td>
                        <td className="text-light">{new Date(ev.date).toLocaleDateString()}</td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary">{ev.participants?.length || 0} Joined</span>
                        </td>
                        <td>
                          <span className="text-secondary small">{ev.volunteers?.length || 0} Assigned</span>
                        </td>
                        <td className="text-end d-flex gap-2 justify-content-end">
                          <button className="btn btn-sm btn-primary" onClick={() => { setSelectedEvent(ev); setView('manage'); }}>
                            ⚙ Manage
                          </button>
                          <button className="btn btn-sm btn-warning" onClick={() => handleEdit(ev)}>✏ Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ev._id)}>🗑 Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT VIEW */}
      {view === 'create' && (
        <div className="card shadow-lg p-5 rounded-4 border-0" style={{ backgroundColor: '#0a1128' }}>
          <form className="row g-4" onSubmit={handleCreateEvent}>
            <div className="col-md-6">
              <label className="text-white small fw-bold mb-2">EVENT TITLE</label>
              <input type="text" className="form-control bg-dark border-secondary text-white py-2" placeholder="Event title" required
                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="text-white small fw-bold mb-2">DATE & TIME</label>
              <input type="datetime-local" className="form-control bg-dark border-secondary text-white py-2" required
                value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="col-md-12">
              <label className="text-white small fw-bold mb-2">LOCATION</label>
              <input type="text" className="form-control bg-dark border-secondary text-white py-2" placeholder="Location" required
                value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="text-white small fw-bold mb-2">DESCRIPTION</label>
              <textarea className="form-control bg-dark border-secondary text-white" rows="4" placeholder="Description"
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-info px-5 py-3 rounded-pill fw-bold text-dark shadow">PUBLISH EVENT</button>
            </div>
          </form>
        </div>
      )}

      {/* MANAGE VIEW */}
      {view === 'manage' && selectedEvent && (

        // 🔥 COMBINED LIST
        (() => {
          const combinedUsers = [
            ...(selectedEvent?.participants || []).map(p => ({
              ...p,
              role: "Participant"
            })),
            ...(selectedEvent?.volunteers || []).map(v => ({
              ...v,
              role: "Volunteer"
            }))
          ];

          return (
            <div className="row g-4">

              {/* LEFT SIDE */}
              <div className="col-lg-8">
                <div className="card p-4 rounded-4 border-0 h-100" style={{ backgroundColor: '#0a1128' }}>

                  <h5 className="text-white fw-bold mb-4 border-bottom border-dark pb-2">
                    Event Members ({combinedUsers.length})
                  </h5>

                  <div className="table-responsive">
                    <table className="table table-dark table-sm border-0">
                      <thead className="text-secondary small">
                        <tr>
                          <th>NAME</th>
                          <th>EMAIL</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {combinedUsers.length > 0 ? (
                          combinedUsers.map(user => (
                            <tr key={user._id}>
                              <td>{user.name}</td>
                              <td className="text-info small">{user.email}</td>
                              <td>
                                {user.role === "Volunteer" ? (
                                  <span className="badge bg-warning text-dark">
                                    Volunteer (Cannot Register)
                                  </span>
                                ) : (
                                  <span className="badge bg-primary">
                                    Registered
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center text-secondary">
                              No members yet
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
                <div className="card p-4 rounded-4 border-0 mb-4" style={{ backgroundColor: '#0a1128' }}>

                  <h5 className="text-info fw-bold mb-3">Volunteers</h5>

                 <div className="d-flex flex-column gap-2 mb-4">
  {selectedEvent.volunteers?.length > 0 ? (
    selectedEvent.volunteers.map(v => (
      <div
        key={v._id}
        className="d-flex justify-content-between align-items-center bg-dark p-2 rounded"
      >
        <span className="text-info">{v.name}</span>

        <button
          className="btn btn-sm btn-danger rounded-pill px-3"
          onClick={() => removeVolunteer(v._id)}
        >
          Remove
        </button>
      </div>
    ))
  ) : (
    <span className="text-secondary small">No volunteers assigned</span>
  )}
</div>
                  <label className="text-white small fw-bold mb-2">Assign Volunteer</label>

                  <select
                    className="form-select bg-dark border-secondary text-white mb-3"
                    onChange={(e) => {
                      const userId = e.target.value;
                      if (userId) assignVolunteer(userId);
                      e.target.value = "";
                    }}
                  >
                    <option value="">Select volunteer...</option>

                    {clubMembers
                      .filter(m => m.clubRole === "Volunteer")
                      .filter(m => !selectedEvent.volunteers?.some(v => v._id === m._id))
                      .map(m => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))
                    }

                    {clubMembers.filter(m => m.clubRole === "Volunteer").length === 0 && (
                      <option disabled>No volunteers in club</option>
                    )}
                  </select>

                </div>
              </div>

            </div>
          );
        })()
      )}

    </div>
  );
};

export default AnnounceEvent;