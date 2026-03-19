import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const FacultyNotifications = ({ clubId }) => {

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {

      const res = await API.get(`/admin/notifications/${clubId}`);
      setNotifications(res.data);

    } catch (err) {
      console.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    if (clubId) fetchNotifications();
  }, [clubId]);

  return (
    <div className="card p-4 rounded-4 shadow bg-dark text-white">

      <h5 className="mb-3 text-info">Notifications</h5>

      {notifications.length === 0 ? (
        <p className="text-secondary">No notifications yet</p>
      ) : (
        notifications.map(n => (

          <div key={n._id} className="border-bottom py-2">

            <div className="fw-bold">{n.title}</div>
            <div className="small text-secondary">{n.message}</div>
            <div className="text-muted small">
              {new Date(n.createdAt).toLocaleString()}
            </div>

          </div>

        ))
      )}

    </div>
  );
};

export default FacultyNotifications;