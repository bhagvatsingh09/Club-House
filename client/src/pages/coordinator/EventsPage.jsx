import React, { useState } from "react";
import EventList from "../../components/events/EventList";
import EventForm from "../../components/events/EventForm";
import AssignVolunteers from "./AssignVolunteers";
import "../styles/EventsPage.css";

const EventsPage = () => {
  const [view, setView] = useState("list");
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>✨ Event Management</h1>
        <p>Organize, create, manage events and assign volunteers.</p>
      </div>

      <div className="events-container">
        {/* Tabs */}
        <div className="events-nav">
          <button
            className={view === "list" ? "active purple" : ""}
            onClick={() => setView("list")}
          >
            📋 Event List
          </button>

          <button
            className={view === "create" ? "active blue" : ""}
            onClick={() => {
              setSelectedEvent(null);
              setView("create");
            }}
          >
            ➕ Create Event
          </button>

          <button
            className={view === "volunteers" ? "active green" : ""}
            onClick={() => setView("volunteers")}
          >
            🙋 Assign Volunteers
          </button>
        </div>

        

        {/* Content */}
        <div className="events-content">
          {view === "list" && (
            <EventList
              onCreate={() => {
                setSelectedEvent(null);
                setView("create");
              }}
              onEdit={(event) => {
                setSelectedEvent(event);
                setView("create");
              }}
            />
          )}

          {view === "create" && (
            <EventForm
              event={selectedEvent}
              onBack={() => setView("list")}
            />
          )}

          {view === "volunteers" && <AssignVolunteers />}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;