import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

const UserLogs = () => {

  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get("/admin/logs");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // FILTER
  const filteredLogs =
    filter === "All"
      ? logs
      : logs.filter(log => log.severity === filter.toLowerCase());

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-info"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold text-white mb-1">System Audit Logs</h2>
          <p className="text-secondary mb-0">
            Monitor all user activities and system-level changes.
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className="card p-3 mb-4 border-0 shadow-sm" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
        <div className="d-flex gap-2">
          {['All', 'Info', 'Warning', 'Danger'].map(lvl => (
            <button 
              key={lvl} 
              onClick={() => setFilter(lvl)}
              className={`btn btn-sm rounded-pill px-3 ${
                filter === lvl ? 'btn-info text-dark fw-bold' : 'btn-dark border-secondary text-secondary'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small">
                <th className="ps-4 py-3">Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Severity</th>
                <th className="pe-4">IP</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map(log => (
                <tr key={log._id}>
                  <td className="ps-4 text-secondary small">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td>
                    <div>
                      <div className="text-white fw-bold small">{log.user}</div>
                      <div className="text-info x-small">{log.role}</div>
                    </div>
                  </td>

                  <td className="text-light small">
                    {log.action}
                  </td>

                  <td>
                    <span className={`badge rounded-pill px-2 py-1 ${
                      log.severity === 'danger'
                        ? 'bg-danger bg-opacity-10 text-danger'
                        : log.severity === 'warning'
                        ? 'bg-warning bg-opacity-10 text-warning'
                        : 'bg-info bg-opacity-10 text-info'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>

                  <td className="pe-4 text-secondary small">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};

export default UserLogs;