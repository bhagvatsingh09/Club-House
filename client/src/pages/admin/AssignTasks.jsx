import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const AssignTasks = () => {
  const [clubs, setClubs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    clubId: '',
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
    if (!formData.clubId) return alert("Please select a club");
    
    setLoading(true);
    try {
      await API.post('/admin/issue-task', formData);
      setFormData({ clubId: '', directive: '', deadline: '', priority: 'Medium' });
      fetchData(); // Refresh list
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

  return (
    <div className="container-fluid">
      <h2 className="fw-bold text-white mb-2">Assign Official Tasks</h2>
      <p className="text-secondary mb-5">Send directives to club coordinators with set deadlines.</p>
      
      {/* --- TASK ISSUANCE FORM --- */}
      <div className="card p-4 rounded-4 shadow-lg mb-5" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
        <form className="row g-4" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <label className="text-secondary small mb-2 text-uppercase fw-bold">Target Club</label>
            <select 
              className="form-select bg-dark border-secondary text-white py-2 shadow-none"
              style={{ backgroundColor: '#050a18', borderColor: '#1a203c' }}
              value={formData.clubId}
              onChange={(e) => setFormData({...formData, clubId: e.target.value})}
              required
            >
              <option value="">Choose a club...</option>
              {clubs.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="text-secondary small mb-2 text-uppercase fw-bold">Task Deadline</label>
            <input 
              type="date" 
              className="form-control bg-dark border-secondary text-white py-2 shadow-none"
              style={{ backgroundColor: '#050a18', borderColor: '#1a203c' }}
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              required 
            />
          </div>
          <div className="col-md-4">
            <label className="text-secondary small mb-2 text-uppercase fw-bold">Priority Level</label>
            <select 
              className="form-select bg-dark border-secondary text-white py-2 shadow-none"
              style={{ backgroundColor: '#050a18', borderColor: '#1a203c' }}
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
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
              onChange={(e) => setFormData({...formData, directive: e.target.value})}
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
        Ongoing Directives <span className="badge bg-info text-dark ms-2 rounded-pill small" style={{fontSize: '10px'}}>{tasks.length}</span>
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
                <tr key={task._id} className="border-dark border-opacity-25">
                  <td className="ps-4 py-3 text-white small" style={{ maxWidth: '300px' }}>{task.directive}</td>
                  <td className="text-info small fw-bold">{task.club?.name}</td>
                  <td className="text-secondary small">{new Date(task.deadline).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge rounded-pill x-small ${
                      task.status === 'Pending' ? 'bg-warning bg-opacity-10 text-warning' : 
                      task.status === 'In Progress' ? 'bg-info bg-opacity-10 text-info' : 
                      'bg-success bg-opacity-10 text-success'
                    }`}>
                      {task.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="pe-4 text-end">
                    <button className="btn btn-sm btn-outline-danger border-0 rounded-circle" onClick={() => deleteTask(task._id)}>🗑️</button>
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