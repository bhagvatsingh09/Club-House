import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";

const VolunteerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id || user?.id;

  useEffect(() => {
    fetchMyEvents();
    fetchAttendance();
    fetchTasks();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await API.get(`/events/volunteer/${userId}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get(`/attendance/${userId}`);
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/volunteer/tasks/${userId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAttendance = async (eventId) => {
    try {
      await API.post(`/attendance/mark`, { eventId, userId });

      setAttendance((prev) => [...prev, { event: eventId }]);

      toast.success("Marked Present ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="container p-4">
      <h2 className="text-success fw-bold mb-4">
        🚀 Volunteer Smart Dashboard
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row g-4">
          {events.map((event) => {
            const isPresent = attendance.some(
              (a) => a.eventId?.toString() === event._id
            );

            return (
              <div key={event._id} className="col-md-6">
                <div className="card p-4 shadow border-0 bg-dark text-white rounded-4">
                  <h4>{event.title}</h4>
                  <p>📅 {new Date(event.date).toLocaleDateString()}</p>

                  {isPresent ? (
                    <button
                      className="btn btn-info btn-sm mb-3"
                      onClick={() => setSelectedEvent(event)}
                    >
                      🔍 View Details
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm mb-3"
                      onClick={() => markAttendance(event._id)}
                    >
                      ✅ Mark Present
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">

            <h3>{selectedEvent.title}</h3>
            <p>📅 {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p>📍 {selectedEvent.location}</p>
            <p>{selectedEvent.description}</p>

            {/* Attendance */}
            <h5 className="mt-3 text-success">
              ✅ Attendance: Present
            </h5>

            {/* Participants */}
            <h5 className="mt-3">👥 Participants</h5>
            {selectedEvent.participants?.length > 0 ? (
              selectedEvent.participants.map((p) => (
                <div key={p._id}>
                  {p.name} ({p.email})
                </div>
              ))
            ) : (
              <p>No participants</p>
            )}

            <h5 className="mt-3">📝 Your Task</h5>

            {(() => {
              const myVolunteer = selectedEvent.volunteers?.find(
                (v) => (v.user?._id || v.user).toString() === userId.toString()
              );


              return myVolunteer && myVolunteer.task ? (
                <div className="mb-2">
                  <strong>{myVolunteer.task}</strong>

                  {myVolunteer.deadline && (
                    <div>
                      Deadline:{" "}
                      {new Date(myVolunteer.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <p>No tasks assigned</p>
              );
            })()}

            <button
              className="btn btn-danger mt-3"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;