import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const AnnounceEvent = () => {
  const [view, setView] = useState('list');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const clubId = user?.clubId;

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    capacity: 100,
    club: clubId
  });

  const fetchData = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const res = await API.get(`/events/club/${clubId}`);
      setEvents(res.data || []);
    } catch (err) {
      console.error("Fetch failed", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      setFormData({
        title: '',
        date: '',
        location: '',
        description: '',
        capacity: 100,
        club: clubId
      });

      fetchData();
    } catch (err) {
      alert("Action failed");
    }
  };

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

  const handleDelete = async (eventId) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await API.delete(`/events/${eventId}`);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="text-white">Events</h2>

        {view === 'list' ? (
          <button className="btn btn-info" onClick={() => setView('create')}>
            + Create Event
          </button>
        ) : (
          <button className="btn btn-light" onClick={() => setView('list')}>
            ← Back
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <table className="table table-dark">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Participants</th>
              <th>Volunteers</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map(ev => (
              <tr key={ev._id}>
                <td>{ev.title}</td>
                <td>{new Date(ev.date).toLocaleDateString()}</td>
                <td>{ev.participants?.length || 0}</td>
                <td>{ev.volunteers?.length || 0}</td>

                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(ev)}>
                    Edit
                  </button>

                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ev._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* CREATE VIEW */}
      {view === 'create' && (
  <div style={{ maxWidth: "400px" }}>
    <h3>Create Event</h3>

    <form onSubmit={handleCreateEvent}>

      <div>
        <label>Title</label><br />
        <input
          type="text"
          required
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <label>Date</label><br />
        <input
          type="datetime-local"
          required
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <div>
        <label>Location</label><br />
        <input
          type="text"
          required
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div>
        <label>Description</label><br />
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <br />

      <button type="submit">
        {selectedEvent ? "Update Event" : "Create Event"}
      </button>

    </form>
  </div>
)}

    </div>
  );
};

export default AnnounceEvent;