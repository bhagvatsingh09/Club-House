import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import "../../pages/styles/EventForm.css";

const EventForm = ({ event, onBack }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const clubId = user?.clubId;

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    club: clubId,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        date: event.date ? event.date.slice(0, 16) : "",
        location: event.location || "",
        description: event.description || "",
        club: event.club,
      });
    }
  }, [event]);

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else if (new Date(formData.date) < new Date()) {
      newErrors.date = "Date must be in the future";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Minimum 10 characters required";
    }

    return newErrors;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (event) {
        await API.put(`/events/${event._id}`, formData);
      } else {
        await API.post("/events/create", formData);
      }

      onBack();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <div className="event-form-wrapper">
      <div className="event-form-card">
        <h2>{event ? "✏️ Edit Event" : "✨ Create New Event"}</h2>
        <p>Fill all details professionally</p>

        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter event title"
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          {/* DATE */}
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            {errors.date && <span className="error">{errors.date}</span>}
          </div>

          {/* LOCATION */}
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Enter event location"
            />
            {errors.location && (
              <span className="error">{errors.location}</span>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Write event details..."
            />
            {errors.description && (
              <span className="error">{errors.description}</span>
            )}
          </div>

          {/* BUTTONS */}
          <div className="form-buttons">
            <button type="submit" className="save-btn">
              {event ? "Update Event" : "Create Event"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={onBack}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;