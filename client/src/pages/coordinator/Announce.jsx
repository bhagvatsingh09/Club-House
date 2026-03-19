import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const AnnounceEvent = () => {
  const [view, setView] = useState('list');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '', date: '', location: '', description: '', capacity: 100, club: JSON.parse(localStorage.getItem('user'))?.clubId 
  });

 const fetchData = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.clubId) return;

      const [eventRes, memberRes] = await Promise.all([
        API.get(`/events/club/${user.clubId}`),
        // Ensure this matches your backend route prefix
        API.get(`/club/${user.clubId}/members`) 
      ]);
      
      setEvents(eventRes.data);
      setClubMembers(memberRes.data);
    } catch (err) { 
      console.error("Data fetch failed", err); 
      // Detailed error logging to see if it's a URL or Network issue
      console.log("Attempted URL:", err.config?.url);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await API.post('/events/create', formData);
      setView('list');
      fetchData();
    } catch (err) { alert("Failed to create event"); }
  };

  const assignVolunteer = async (userId) => {
    try {
      const res = await API.put(`/events/${selectedEvent._id}/assign-volunteer`, { userId });
      setSelectedEvent(res.data);
      fetchData();
    } catch (err) { alert("Error assigning volunteer"); }
  };

  return (
    <div className="container-fluid py-4">
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-dark pb-4">
        <div>
          <h2 className="fw-bold text-white">Event Control Center</h2>
          <p className="text-secondary mb-0">Manage registrations and logistics for your club events.</p>
        </div>
        {view === 'list' ? (
          <button className="btn btn-info px-4 rounded-pill fw-bold text-dark" onClick={() => setView('create')}>+ Create New Event</button>
        ) : (
          <button className="btn btn-outline-light px-4 rounded-pill" onClick={() => setView('list')}>← Back to List</button>
        )}
      </div>

      {/* --- VIEW 1: LIST --- */}
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
                    {events.map(event => (
                      <tr key={event._id} className="border-bottom border-dark border-opacity-50">
                        <td className="fw-bold text-info">{event.title}</td>
                        <td className="text-light">{new Date(event.date).toLocaleDateString()}</td>
                        <td><span className="badge bg-primary bg-opacity-10 text-primary">{event.participants.length} Joined</span></td>
                        <td><span className="text-secondary small">{event.volunteers.length} Assigned</span></td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-info rounded-pill px-3" onClick={() => { setSelectedEvent(event); setView('manage'); }}>Manage</button>
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

      {/* --- VIEW 2: CREATE --- */}
      {view === 'create' && (
        <div className="card shadow-lg p-5 rounded-4 border-0" style={{ backgroundColor: '#0a1128' }}>
          <form className="row g-4" onSubmit={handleCreateEvent}>
            <div className="col-md-6">
              <label className="text-white small fw-bold mb-2">EVENT TITLE</label>
              <input type="text" className="form-control bg-dark border-secondary text-white py-2" placeholder="e.g. Hackfest 2026" required onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="text-white small fw-bold mb-2">DATE & TIME</label>
              <input type="datetime-local" className="form-control bg-dark border-secondary text-white py-2" required onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="col-md-12">
              <label className="text-white small fw-bold mb-2">LOCATION</label>
              <input type="text" className="form-control bg-dark border-secondary text-white py-2" placeholder="Main Auditorium / Zoom Link" required onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="col-12">
              <label className="text-white small fw-bold mb-2">DESCRIPTION</label>
              <textarea className="form-control bg-dark border-secondary text-white" rows="4" placeholder="What is this event about?" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-info px-5 py-3 rounded-pill fw-bold text-dark shadow">PUBLISH EVENT</button>
            </div>
          </form>
        </div>
      )}

      {/* --- VIEW 3: MANAGE --- */}
      {view === 'manage' && selectedEvent && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card p-4 rounded-4 border-0 h-100" style={{ backgroundColor: '#0a1128' }}>
              <h5 className="text-white fw-bold mb-4 border-bottom border-dark pb-2">Registered Students ({selectedEvent.participants.length})</h5>
              <div className="table-responsive">
                <table className="table table-dark table-sm border-0">
                  <thead className="text-secondary small"><tr><th>NAME</th><th>EMAIL</th><th>DATE</th></tr></thead>
                  <tbody>
                    {selectedEvent.participants.map(p => (
                      <tr key={p._id}><td>{p.name}</td><td className="text-info small">{p.email}</td><td className="text-secondary small">Joined</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card p-4 rounded-4 border-0 mb-4" style={{ backgroundColor: '#0a1128' }}>
              <h5 className="text-info fw-bold mb-3">Volunteers</h5>
              <div className="d-flex flex-wrap mb-4">
                {selectedEvent.volunteers.map(v => (
                  <span key={v._id} className="badge bg-info bg-opacity-10 text-info p-2 me-2 mb-2 rounded-2">{v.name}</span>
                ))}
              </div>
              <label className="text-white small fw-bold mb-2">Assign Member</label>
              <select className="form-select bg-dark border-secondary text-white mb-3" onChange={e => assignVolunteer(e.target.value)}>
                <option value="">Select a member...</option>
                {clubMembers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnounceEvent;