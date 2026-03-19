import React, { useState } from 'react';

const UserLogs = () => {
  // Mock Data for Logs
  const [logs] = useState([
    { id: 1, user: "Dr. Aris", role: "Coordinator", action: "Deleted Event: 'Old Tech Meet'", timestamp: "2026-03-15 14:20", severity: "danger", ip: "192.168.1.45" },
    { id: 2, user: "Aryan Sharma", role: "Student", action: "Registered for 'Hackathon 2026'", timestamp: "2026-03-15 13:05", severity: "info", ip: "102.45.12.1" },
    { id: 3, user: "System Admin", role: "Admin", action: "Assigned Head to 'Music Society'", timestamp: "2026-03-15 11:30", severity: "warning", ip: "127.0.0.1" },
    { id: 4, user: "Sneha Kapur", role: "Student", action: "Updated Profile Picture", timestamp: "2026-03-15 09:15", severity: "info", ip: "172.16.254.1" },
    { id: 5, user: "Unknown", role: "Guest", action: "Failed Login Attempt (Invalid Password)", timestamp: "2026-03-14 23:50", severity: "danger", ip: "45.78.12.90" },
  ]);

  const [filter, setFilter] = useState("All");

  const filteredLogs = filter === "All" ? logs : logs.filter(log => log.severity === filter.toLowerCase());

  return (
    <div className="container-fluid">
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold text-white mb-1">System Audit Logs</h2>
          <p className="text-secondary mb-0">Monitor all user activities and system-level changes.</p>
        </div>
        <div className="d-flex gap-2">
           <button className="btn btn-outline-secondary btn-sm rounded-pill px-3">Export CSV</button>
           <button className="btn btn-outline-danger btn-sm rounded-pill px-3">Clear Logs</button>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="card p-3 mb-4 border-0 shadow-sm" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
        <div className="row align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-secondary text-secondary">🔍</span>
              <input type="text" className="form-control glass-input border-start-0 ps-0" placeholder="Search by user or action..." />
            </div>
          </div>
          <div className="col-md-8 d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
            {['All', 'Info', 'Warning', 'Danger'].map(lvl => (
              <button 
                key={lvl} 
                onClick={() => setFilter(lvl)}
                className={`btn btn-sm rounded-pill px-3 ${filter === lvl ? 'btn-info text-dark fw-bold' : 'btn-dark border-secondary text-secondary'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- LOGS TABLE --- */}
      <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small border-bottom border-dark">
                <th className="ps-4 py-3">Timestamp</th>
                <th>User / Role</th>
                <th>Action Performed</th>
                <th>Severity</th>
                <th className="pe-4">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-bottom border-dark border-opacity-50">
                  <td className="ps-4 text-secondary small">{log.timestamp}</td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="text-white fw-bold small">{log.user}</span>
                      <span className="x-small text-info opacity-75">{log.role}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-light small">{log.action}</span>
                  </td>
                  <td>
                    <span className={`badge rounded-pill x-small px-2 py-1 ${
                      log.severity === 'danger' ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25' : 
                      log.severity === 'warning' ? 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25' : 
                      'bg-info bg-opacity-10 text-info border border-info border-opacity-25'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="pe-4 text-secondary x-small font-monospace">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- LOG RETENTION POLICY NOTE --- */}
      <div className="mt-4 p-3 rounded-3 d-flex align-items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a203c' }}>
        <span className="fs-4">🛡️</span>
        <p className="text-secondary x-small mb-0">
          <strong>Security Note:</strong> Logs are retained for 30 days. Critical 'Danger' level logs are archived for 1 year. 
          Unauthorized access to this panel is recorded.
        </p>
      </div>
    </div>
  );
};

export default UserLogs;