import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [clubFilter, setClubFilter] = useState("All");

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await API.get("/admin/volunteers");
      setVolunteers(res.data);
      setFiltered(res.data);
      // console.log(res.data)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 FILTER + SEARCH
  useEffect(() => {
    let data = volunteers;

    if (search) {
      data = data.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (clubFilter !== "All") {
      data = data.filter(
        v => v.clubId && v.clubId.name === clubFilter
      );
    }

    setFiltered(data);
  }, [search, clubFilter, volunteers]);

  // 📊 COUNT PER CLUB
  const clubCounts = volunteers.reduce((acc, v) => {
    const club = v.clubId?.name || "Unknown";
    acc[club] = (acc[club] || 0) + 1;
    return acc;
  }, {});

  // ❌ REMOVE
  const handleRemove = async (id) => {
    if (!window.confirm("Remove this volunteer?")) return;

    try {
      await API.delete(`/admin/volunteer/${id}`);
      fetchVolunteers();
    } catch (err) {
      alert("Failed to remove");
    }
  };
  const toggleVolunteer = async (id) => {
    try {
      await API.put(`/admin/toggle-volunteer/${id}`);
      fetchVolunteers();
    } catch (err) {
      alert("Failed to update role");
    }
  };


  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold text-success">Club Volunteers</h2>
        <p className="text-secondary">
          Manage volunteers and their event assignments.
        </p>
      </div>

      {/* 🔍 SEARCH + FILTER */}
      <div className="d-flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search volunteer..."
          className="form-control bg-transparent text-light border-light"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center text-info py-5">Loading...</div>
      ) : (
        <div className="row g-4">
          {filtered.map((v) => (
            <div className="col-md-6 col-lg-4" key={v._id || v.id}>
              <div className="card p-4 shadow-lg border-0 h-100"
                style={{ backgroundColor: "#050a18" }}
              >


                {/* USER */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${v.name}`}
                    className="rounded-circle border border-success"
                    style={{ width: "60px" }}
                    alt=""
                  />
                  <div>
                    <h5 className="text-white mb-0">{v.name}</h5>
                    <p className="text-success small">{v.email}</p>
                  </div>
                </div>

                <hr className="border-secondary" />

                {/* 📌 EVENTS */}
                <div className="mb-3">
                  <span className="text-secondary small">Assigned Events:</span>
                  <div className="mt-2">
                    {v.assignedEvents?.length > 0 ? (
                      v.assignedEvents.map(e => (
                        <span key={e._id || e.id} className="badge bg-info me-2 mb-1">
                          {e.title}
                        </span>
                      ))
                    ) : (
                      <span className="text-secondary small">None</span>
                    )}
                  </div>
                </div>

                {/* DETAILS */}
                <div className="small text-light">
                  <p>Dept: {v.department || "N/A"}</p>
                  <p>Year: {v.year || "N/A"}</p>
                  <p>Phone: {v.phone || "N/A"}</p>
                </div>

                {/* ACTION */}
                <button
                  className={`btn btn-sm mt-3 ${v.clubRole === "Volunteer"
                      ? "btn-outline-danger"
                      : "btn-outline-success"
                    }`}
                  onClick={() => toggleVolunteer(v._id)}
                >
                  {v.clubRole === "Volunteer"
                    ? "Remove Volunteer"
                    : "Make Volunteer"}
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerList;