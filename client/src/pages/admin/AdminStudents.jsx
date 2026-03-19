import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // Options: "all", "joined", "not-joined"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/admin/students");
        setStudents(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Complex Filter Logic: Handles Search + Joined Status
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const hasClubs = s.clubs.length > 0;

    if (statusFilter === "joined") return matchesSearch && hasClubs;
    if (statusFilter === "not-joined") return matchesSearch && !hasClubs;
    return matchesSearch; // "all" case
  });

  if (loading) return (
    <div className="text-center p-5 text-white">
      <div className="spinner-border text-info"></div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="row mb-4 align-items-end g-3">
        <div className="col-12 col-md-4">
          <h3 className="text-white fw-bold mb-0">Student Directory</h3>
          <p className="text-secondary small mb-0">Total: {filteredStudents.length} students</p>
        </div>

        {/* Search Bar */}
        <div className="col-md-4">
          <label className="text-secondary small fw-bold mb-1">SEARCH</label>
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary shadow-none"
            placeholder="Name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="col-md-4">
          <label className="text-secondary small fw-bold mb-1">MEMBERSHIP STATUS</label>
          <select 
            className="form-select bg-dark text-white border-secondary shadow-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Students</option>
            <option value="joined">Joined a Club</option>
            <option value="not-joined">No Clubs Joined</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead className="text-secondary border-secondary">
            <tr style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>JOINED CLUBS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s) => (
                <tr key={s._id} className="border-secondary">
                  <td className="text-white fw-bold py-3">{s.name}</td>
                  <td className="text-secondary">{s.email}</td>
                  <td>
                    {s.clubs.length > 0 ? (
                      s.clubs.map((clubName, i) => (
                        <span 
                          key={i} 
                          className="badge border border-secondary me-2 mb-1 fw-normal"
                          style={{ color: "#ffffff", backgroundColor: "rgba(255,255,255,0.08)", fontSize: '0.75rem' }}
                        >
                          {clubName}
                        </span>
                      ))
                    ) : (
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 small px-2 py-1">
                        No Club Joined
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-5 text-secondary">
                  No records match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStudents;