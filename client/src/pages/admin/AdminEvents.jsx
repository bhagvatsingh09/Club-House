import React, { useState, useEffect } from "react";
import API from "../../api/axios";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, past

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/admin/all-events"); // your API to get all events
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filter === "all") return true;
    const now = new Date();
    const eventDate = new Date(e.date);
    return filter === "upcoming" ? eventDate >= now : eventDate < now;
  });

  if (loading) return <div className="text-center text-white p-5">Loading...</div>;

  return (
    <div className="container py-3">
      {/* Filter Buttons */}
      <div className="mb-3 d-flex gap-2">
        {["all", "upcoming", "past"].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-info" : "btn-outline-secondary"}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Event List */}
      <div className="list-group">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((e) => (
            <div
              key={e._id}
              className="list-group-item mb-2"
              style={{
                backgroundColor: "#0a1128",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px 15px",
              }}
            >
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-bold">{e.title}</div>
                  <div className="small text-secondary">{e.club?.name || "No club assigned"}</div>
                </div>
                <div className="small text-info">
                  {new Date(e.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-secondary small">No events found</div>
        )}
      </div>
    </div>
  );
};

export default EventList;