import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import { toast } from "react-hot-toast";

const EventRegister = () => {
  const { eventId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState(state?.event || null);

  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    department: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  // 🔥 FETCH EVENT IF PAGE REFRESH
  useEffect(() => {
    if (!event) {
      const fetchEvent = async () => {
        try {
          const res = await API.get(`/events?eventId=${eventId}`);
          setEvent(res.data[0]); // assuming array
        } catch {
          toast.error("Failed to load event");
        }
      };
      fetchEvent();
    }
  }, [event, eventId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      return toast.error("Login required");
    }

    try {
      const res = await API.post(`/events/${eventId}/register`, {
        userId,
        extraDetails: formData
      });

      toast.success(res.data.message);
      navigate(-1);

    } catch (err) {
      console.error(err); // 🔥 DEBUG
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="container mt-4 text-white">

      <h3>{event?.title || "Loading..."}</h3>
      <p>{event?.description}</p>

      <form onSubmit={handleSubmit} className="card bg-dark p-3">

        <input
          name="name"
          placeholder="Name"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />

        <input
          name="roll"
          placeholder="Roll Number"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />

        <input
          name="department"
          placeholder="Department"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />

        <button className="btn btn-success mt-2">
          Submit & Register
        </button>

      </form>
    </div>
  );
};

export default EventRegister;