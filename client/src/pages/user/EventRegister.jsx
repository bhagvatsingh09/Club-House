import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import { toast } from "react-hot-toast";

const EventRegister = () => {
  const { eventId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState(state?.event || null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!event) {
          const res = await API.get(`/events?eventId=${eventId}`);
          setEvent(res.data[0]);
        }

        const regRes = await API.get(`/users/${userId}/registrations`);
        const exists = regRes.data.some(r => r._id === eventId);
        setRegistered(exists);

      } catch {
        toast.error("Error loading data");
      }
    };

    if (userId) fetchEvent();
  }, [eventId]);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await API.post(`/events/${eventId}/register`, {
        userId,
        extraDetails: {
          name: user.name,
          studentId: user.studentId,
          department: user.department,
          year: user.year
        }
      });

      toast.success(res.data.message);
      setRegistered(true);

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 text-white">

      {/* HERO */}
      <div className="card bg-dark border-secondary p-4 mb-4 shadow-lg rounded-4">
        <h2 className="fw-bold text-info">{event?.title || "Loading..."}</h2>
        <p className="text-light opacity-75">{event?.description}</p>

        <div className="d-flex flex-wrap gap-2 mt-2">
          <span className="badge bg-secondary">📅 {event?.date || "TBA"}</span>
          <span className="badge bg-secondary">📍 {event?.mode || "Offline"}</span>
          <span className="badge bg-secondary">🏆 {event?.type || "Competition"}</span>
        </div>
      </div>

      <div className="row">

        {/* USER CARD */}
        <div className="col-md-5 mb-4">
          <div className="card bg-dark border-secondary p-4 rounded-4 shadow h-100">

            <div className="text-center mb-3">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.name}`}
                className="rounded-circle border border-info mb-2"
                style={{ width: "85px", height: "85px" }}
                alt="avatar"
              />
              <h5 className="text-info fw-bold">{user?.name}</h5>
              <p className="text-light small">{user?.email}</p>
            </div>

            <hr className="border-secondary" />

            <div className="small">
              <p><span className="text-secondary">🎓 ID:</span> <span className="text-light">{user?.studentId || "N/A"}</span></p>
              <p><span className="text-secondary">🏫 Dept:</span> <span className="text-light">{user?.department || "N/A"}</span></p>
              <p><span className="text-secondary">📅 Year:</span> <span className="text-light">{user?.year || "N/A"}</span></p>
            </div>

          </div>
        </div>

        {/* CTA CARD */}
        <div className="col-md-7">
          <div className="card bg-dark border-secondary p-5 rounded-4 shadow h-100 d-flex flex-column justify-content-between">

            {/* TOP INFO */}
            <div>
              <h4 className="text-info fw-bold mb-3">🚀 Confirm Registration</h4>

              <p className="text-light mb-3">
                You are about to register for this event. Your profile details will be used automatically.
              </p>

              {/* EXTRA DETAILS */}
              <div className="bg-black bg-opacity-25 rounded-3 p-3 mb-3">
                <p className="mb-1 text-secondary small">📌 Important Info</p>
                <ul className="small text-light mb-0">
                  <li>No changes allowed after registration</li>
                  <li>Bring college ID on event day</li>
                  <li>Check email for updates</li>
                </ul>
              </div>

              {registered && (
                <div className="alert alert-success border-0">
                  ✅ You are already registered
                </div>
              )}
            </div>

            {/* BUTTON */}
            <button
              className={`btn w-100 py-3 fw-bold rounded-pill ${
                registered ? "btn-secondary" : "btn-success"
              }`}
              onClick={handleRegister}
              disabled={registered || loading}
            >
              {registered
                ? "Already Registered"
                : loading
                ? "Registering..."
                : "Confirm & Register"}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EventRegister;