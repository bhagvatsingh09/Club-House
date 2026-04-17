import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const MemberManagement = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [events, setEvents] = useState([]);

  const clubId = user?.clubId;

  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // NEW 
 const fetchMembers = async () => {
  if (!clubId) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    const [membersRes, eventsRes] = await Promise.all([
      API.get(`/club/${clubId}/members`),
      API.get(`/events/club/${clubId}`)
    ]);

    // Members
    if (Array.isArray(membersRes.data)) {
      setMembers(membersRes.data);
    } else {
      setMembers([]);
    }

    // Events (NEW)
    setEvents(eventsRes.data || []);

  } catch (err) {
    console.error(err);
    setMembers([]);
    setEvents([]); // NEW
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMembers();
  }, [clubId]);

  const handleRoleChange = async (userId, newRole) => {
    if (newRole === "Remove") {
      const confirm = window.confirm("Remove this member?");
      if (!confirm) return;

      try {
        await API.put(`/club/remove-member/${userId}`);
        fetchMembers();
      } catch {
        alert("Error removing member");
      }

      return;
    }

    try {
      await API.put(`/club/update-role/${userId}`, {
        role: newRole,
        clubId: clubId
        
      });

      fetchMembers();

    } catch (err) {
      alert(err.response?.data?.message || "Error updating role");
    }
  };

  const filteredMembers = members.filter(member => {
    const name = member?.name?.toLowerCase?.() || "";
    const roll = member?.roll?.toLowerCase?.() || "";

    return (
      name.includes(searchTerm.toLowerCase()) ||
      roll.includes(searchTerm.toLowerCase())
    );
  });

  const totalMembers = members.length;

  const totalVolunteers = members.filter(
    m => m?.clubRole === "Volunteer"
  ).length;

  const totalRegularMembers = members.filter(
    m => m?.clubRole !== "Volunteer"
  ).length;

 const getVolunteerEventData = (memberId) => {
  for (let ev of events) {
    const found = ev.volunteers?.find(
      v => v.user && v.user.toString() === memberId
    );

    if (found) {
      return found;
    }
  }
  return null;
};

  return (
    <div className="container-fluid p-0">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white fw-bold">Manage Members</h2>

        <input
          type="text"
          placeholder="Search member..."
          className="form-control w-auto bg-dark text-white border-secondary"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* STATS */}
      <div className="row mb-4">

        <div className="col-md-4">
          <div className="card bg-dark text-white p-3 shadow rounded-4">
            <h6>Total Members</h6>
            <h3 className="text-info">{totalMembers}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-dark text-white p-3 shadow rounded-4">
            <h6>Volunteers</h6>
            <h3 className="text-warning">{totalVolunteers}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-dark text-white p-3 shadow rounded-4">
            <h6>Regular Members</h6>
            <h3 className="text-success">{totalRegularMembers}</h3>
          </div>
        </div>

      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info"></div>
        </div>
      ) : (

        <div className="row g-4">

          {filteredMembers.length === 0 && (
            <p className="text-secondary text-center">
              No members found
            </p>
          )}

{filteredMembers.map(member => {
  const eventData = getVolunteerEventData(member._id);

  return (
    <div className="col-md-6 col-lg-4" key={member._id}>
      <div className="card bg-dark text-white p-4 rounded-4 shadow-lg h-100 position-relative">

        <h5>{member?.name}</h5>

        <p className="text-info small mb-2">
          {member?.roll || member?.email}
        </p>

        {/* Volunteer Badge */}
        {member?.clubRole === "Volunteer" && (
          <span
            className="badge bg-warning text-dark position-absolute"
            style={{ top: "10px", right: "10px" }}
          >
            🏅 Volunteer
          </span>
        )}

        {/* 🔥 EVENT BASED ROLE */}
        {eventData?.role && (
          <p className="small text-warning mb-1">
            Role: {eventData.role}
          </p>
        )}

        {/* 🔥 TASK */}
        {eventData?.task && (
          <p className="small text-light mb-1">
            Task: {eventData.task}
          </p>
        )}

        {/* 🔥 DEADLINE */}
        {eventData?.deadline && (
          <p className="small text-danger mb-2">
            Deadline:{" "}
            {new Date(eventData.deadline).toLocaleDateString()}
          </p>
        )}

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mt-3">

            <span className="text-secondary small">
              {member?.clubRole || "Member"}
            </span>

            <select
              className="form-select form-select-sm bg-dark text-white border-secondary w-auto"
              value={
                member?.clubRole === "Volunteer"
                  ? "Volunteer"
                  : "Member"
              }
              onChange={(e) =>
                handleRoleChange(member._id, e.target.value)
              }
            >
              <option value="Member">Member</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Remove">Remove</option>
            </select>

          </div>
        </div>

      </div>
    </div>
  );
})}

        </div>

      )}

    </div>
  );
};

export default MemberManagement;