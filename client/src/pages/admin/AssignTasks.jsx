import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const AssignTasks = () => {
  const [clubs, setClubs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    clubId: [],   // ✅ MUST be array
    directive: '',
    deadline: '',
    priority: 'Medium'
  });

  const fetchData = async () => {
    try {
      const [clubRes, taskRes] = await Promise.all([
        API.get('/admin/all-clubs'),
        API.get('/admin/all-tasks')
      ]);
      setClubs(clubRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.clubId.length === 0) {
      return alert("Please select at least one club");
    }

    if (!formData.deadline) {
      return alert("Please select a deadline");
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.deadline).setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return alert("Deadline cannot be in the past");
    }
    if (selectedDate <= today)

      setLoading(true);
    try {
      await API.post('/admin/issue-task', formData);

      setFormData({
        clubId: [],
        directive: '',
        deadline: '',
        priority: 'Medium'
      });

      fetchData();
    } catch (err) {
      alert("Failed to issue task");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm("Delete this directive?")) {
      await API.delete(`/admin/delete-task/${id}`);
      fetchData();
    }
  };

  const filteredClubs = clubs.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <h2 className="fw-bold text-white mb-2">Assign Official Tasks</h2>
      <p className="text-secondary mb-5">Send directives to club coordinators with set deadlines.</p>

      {/* --- TASK ISSUANCE FORM --- */}
      <div className="card p-4 rounded-4 shadow-lg mb-5" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
        <form className="row g-4" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label className="text-secondary small mb-2 text-uppercase fw-bold">
              Target Clubs
            </label>

            {/* 🔍 Search */}
            <input
              type="text"
              placeholder="Search clubs..."
              className="form-control mb-2 bg-dark text-white border-secondary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* ⚡ Actions */}
            <div className="d-flex justify-content-between mb-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-info"
                onClick={() => setFormData({ ...formData, clubId: clubs.map(c => c._id) })}
              >
                Select All
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => setFormData({ ...formData, clubId: [] })}
              >
                Clear
              </button>
            </div>

            {/* 📋 List */}
            <div
              className="border rounded p-2"
              style={{ maxHeight: "150px", overflowY: "auto" }}
            >
              {filteredClubs.map(c => (
                <div key={c._id} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.clubId.includes(c._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          clubId: [...formData.clubId, c._id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          clubId: formData.clubId.filter(id => id !== c._id)
                        });
                      }
                    }}
                  />
                  <label className="form-check-label text-white">
                    {c.name}
                  </label>
                </div>
              ))}
            </div>

            {/* 🏷 Selected Chips */}
            <div className="mt-2 d-flex flex-wrap gap-2">
              {formData.clubId.map(id => {
                const club = clubs.find(c => c._id === id);
                return (
                  <span
                    key={id}
                    className="badge bg-info text-dark px-2 py-1 d-flex align-items-center"
                  >
                    {club?.name}
                    <span
                      style={{ cursor: "pointer", marginLeft: "6px" }}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          clubId: formData.clubId.filter(cId => cId !== id)
                        })
                      }
                    >
                      ✕
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="col-md-4">
            <label className="text-secondary small mb-2 text-uppercase fw-bold">Task Deadline</label>
            <input
              type="date"
              className="form-control bg-dark border-secondary text-white py-2 shadow-none"
              style={{ backgroundColor: '#050a18', borderColor: '#1a203c' }}
              value={formData.deadline}
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="text-secondary small mb-2 text-uppercase fw-bold">Priority Level</label>
            <select
              className="form-select bg-dark border-secondary text-white py-2 shadow-none"
              style={{ backgroundColor: '#050a18', borderColor: '#1a203c' }}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
          <div className="col-12">
            <label className="text-secondary small mb-2 text-uppercase fw-bold">Task/Event Directive</label>
            <textarea
              className="form-control bg-dark border-secondary text-white shadow-none"
              style={{ backgroundColor: '#050a18', borderColor: '#1a203c' }}
              rows="3"
              placeholder="Describe the mission for the club..."
              value={formData.directive}
              onChange={(e) => setFormData({ ...formData, directive: e.target.value })}
              required
            ></textarea>
          </div>
          <div className="col-12 text-end">
            <button className="btn btn-info px-5 rounded-pill fw-bold text-dark shadow" disabled={loading}>
              {loading ? 'Issuing...' : 'Issue Directive'}
            </button>
          </div>
        </form>
      </div>

      {/* --- ONGOING TASKS LIST --- */}
      <h5 className="text-info fw-bold mb-3 d-flex align-items-center">
        Ongoing Directives <span className="badge bg-info text-dark ms-2 rounded-pill small" style={{ fontSize: '10px' }}>{tasks.length}</span>
      </h5>

      <div className="card p-0 rounded-4 border-0 overflow-hidden shadow-lg" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="small text-secondary text-uppercase" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th className="ps-4 py-3">Task Directive</th>
                <th>Assigned Club</th>
                <th>Deadline</th>
                <th>Status</th>
                <th className="pe-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id}>
                  <td>{task.directive}</td>

                  <td>
                    {task.clubs?.map(c => c.name).join(", ")}
                  </td>

                  <td>
                    {new Date(task.deadline).toLocaleDateString()}
                  </td>

                  <td>
                    {task.responses?.length > 0 ? (
                      task.responses.map((r, index) => (
                        <div key={r.club?._id || r.club || index}>
                          <span className={`badge ${r.status === 'Pending' ? 'bg-warning' :
                            r.status === 'Accepted' ? 'bg-success' :
                              'bg-danger'
                            }`}>
                            {r.status?.toUpperCase()}
                          </span>

                          {r.reason && (
                            <small className="text-danger ms-2">
                              ({r.reason})
                            </small>
                          )}
                        </div>
                      ))
                    ) : (
                      <span>No responses</span>
                    )}
                  </td>

                  <td>
                    <button onClick={() => deleteTask(task._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-secondary">No active directives found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignTasks;