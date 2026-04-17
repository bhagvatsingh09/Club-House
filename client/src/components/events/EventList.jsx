import React, { useEffect, useState } from "react";
import API from "../../api/axios";
  import "../../pages/styles/EventList.css";

const EventList = ({ onEdit }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const clubId = user?.clubId;
  

  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get(`/events/club/${clubId}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <div className="event-list-container">
      {events.length === 0 ? (
        <p>No Events Found</p>
      ) : (
        events.map((ev) => (
          <div className="event-box" key={ev._id}>
            <h3>{ev.title}</h3>
            <p>{new Date(ev.date).toLocaleDateString()}</p>
            <p>{ev.location}</p>

            {/* ================= Volunteers ================= */}
            <div className="assigned-list">
              <h4>Volunteers ({ev.volunteers?.length || 0})</h4>

              {ev.volunteers?.length > 0 ? (
                ev.volunteers.map((v, i) => (
  <div key={v.user?._id || i} className="volunteer-row">
                    <span>{v.user?.name}</span>
                    {/* <span>{v.role || "No Role"}</span> */}
                    <span>{v.task || "No Task"}</span>
                  </div>
                ))
              ) : (
                <p>No Volunteers Assigned</p>
              )}
            </div>

            {/* ================= Participants ================= */}
            <div className="participants-section">
              <h4>Participants ({ev.participants?.length || 0})</h4>

              {ev.participants?.length > 0 ? (
                ev.participants.map((p, i) => (
  <div key={p._id || i} className="participant-row">
                    <span>{p.name}</span>
                    <span>{p.email}</span>
                  </div>
                ))
              ) : (
                <p>No Participants</p>
              )}
            </div>

            {/* ================= Actions ================= */}
            <div className="event-actions">
              <button onClick={() => onEdit(ev)}>Edit</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EventList;