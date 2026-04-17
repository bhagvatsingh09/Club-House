// AssignVolunteers.jsx

import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "../styles/AssignVolunteers.css";
import { FaTrash } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

const AssignVolunteers = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  // console.log(user.clubId);
  const clubId = user?.clubId;

  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [role, setRole] = useState("");
  const [assignedTask, setAssignedTask] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskValue, setEditTaskValue] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchVolunteers();
    fetchAttendance();

    const interval = setInterval(fetchAttendance, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get(`/events/club/${clubId}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const res = await API.get(`/users/club-volunteers/${clubId}`);
      // console.log("Volunteer Data:", res.data);
      setVolunteers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    if (!selectedEvent || !selectedVolunteer || !assignedTask) {
      return alert("Fill all fields");
    }

    try {
      await API.put(`/events/${selectedEvent}/assign-volunteer`, {
        userId: selectedVolunteer,
        role,
        assignedTask, // ✅ ADD THIS
      });

      alert("Volunteer Assigned");

      setSelectedVolunteer("");
      setRole("");
      setAssignedTask(""); // ✅ reset
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed");
    }
  };

  const removeVolunteer = async (eventId, userId) => {
    try {
      await API.delete(
        `/events/${eventId}/remove-volunteer/${userId}`
      );

      fetchEvents();

    } catch (err) {
      console.error(err);
      alert("Failed to remove volunteer");
    }
  };

  const updateTask = async (eventId, userId) => {
    try {
      await API.put(`/events/${eventId}/update-task`, {
        userId,
        task: editTaskValue
      });

      setEditTaskId(null);
      setEditTaskValue("");
      fetchEvents();
    } catch (err) {
      alert("Task update failed");
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance/all");
      // console.log("Attendance Count:", res.data.length);
      setAttendanceData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const isVolunteerPresent = (eventId, userId) => {
    return attendanceData.some((a) => {
      return (
        String(a.eventId) === String(eventId) &&
        String(a.userId) === String(userId)
      );
    });
  };

  return (
    <div className="assign-page">
      <div className="assign-card">
        <h1>Assign Volunteers</h1>
        <p>Manage event volunteers professionally</p>

        <div className="form-grid">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">Select Event</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>

          <select
            value={selectedVolunteer}
            onChange={(e) => setSelectedVolunteer(e.target.value)}
          >
            <option value="">Select Volunteer</option>
            {volunteers.map((vol) => (
              <option key={vol._id} value={vol._id}>
                {vol.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Assign Task"
            value={assignedTask}
            onChange={(e) => setAssignedTask(e.target.value)}
          />

          <button onClick={handleAssign}>Assign</button>

        </div>
      </div>

      <div className="event-list-box">
        {events.map((ev) => (
          <div className="event-box" key={ev._id}>
            <h3>{ev.title}</h3>
            <p>{new Date(ev.date).toLocaleDateString()}</p>

            <div className="assigned-list">
              {ev.volunteers?.length > 0 ? (
                ev.volunteers.map((v, i) => (
                  <div key={i} className="volunteer-row">
                    <span>
                      {v.user?.name || v.user}
                    </span>
                    

                    <span className={`badge ${isVolunteerPresent(ev._id, v.user?._id || v.user)
                        ? "bg-success"
                        : "bg-danger"
                      }`}>
                      {isVolunteerPresent(ev._id, v.user?._id || v.user)
                        ? "Present"
                        : "Absent"}
                    </span>
                    <span>{v.role}</span>
                    {editTaskId === v.user?._id ? (
                      <div>
                        <input
                          value={editTaskValue}
                          onChange={(e) => setEditTaskValue(e.target.value)}
                        />
                        <button onClick={() => updateTask(ev._id, v.user?._id)}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <span>{v.task}</span>
                    )}
                    <button
                      className="remove-icon-btn"
                      onClick={() => removeVolunteer(ev._id, v.user?._id)}
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => {
                        setEditTaskId(v.user?._id);
                        setEditTaskValue(v.task);
                      }}
                    >
                      <FaEdit />
                    </button>
                  </div>

                ))
              ) : (
                <p>No Volunteers Assigned</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignVolunteers;