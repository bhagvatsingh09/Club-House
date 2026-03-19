import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await API.post('/auth/login', { email, password });
      
      // Security Check: Ensure ONLY admins can log in through this portal
      if (data.user.role !== 'Admin') {
        setError("Access Denied. Administrator privileges required.");
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      navigate('/admin/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center" style={{ background: '#050a18' }}>
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5" style={{ maxWidth: '450px', width: '100%', backgroundColor: '#0a1128', border: '1px solid #1a203c' }}>
        
        <div className="text-center mb-5">
          {/* Changed text color to warning (yellow/gold) to differentiate the admin portal */}
          <h2 className="fw-bold text-warning mb-2">Admin Portal</h2>
          <p className="text-secondary small">Access the central management system</p>
          {error && <div className="alert alert-danger py-2 small border-0 shadow-sm">{error}</div>}
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">ADMIN EMAIL</label>
            <input 
              type="email" 
              required 
              className="form-control bg-dark border-secondary text-white py-2 shadow-none" 
              placeholder="admin@college.edu" 
              style={{ borderColor: '#1a203c' }}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="mb-4">
            <label className="text-white small fw-bold mb-2">PASSWORD</label>
            <input 
              type="password" 
              required 
              className="form-control bg-dark border-secondary text-white py-2 shadow-none" 
              placeholder="••••••••" 
              style={{ borderColor: '#1a203c' }}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          {/* Changed button to warning to match the admin theme */}
          <button className="btn btn-warning w-100 py-3 rounded-pill fw-bold text-dark shadow-sm mb-4" type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'AUTHORIZE ACCESS'}
          </button>
        </form>

        <div className="text-center">
          {/* Removed the registration link since admins shouldn't sign themselves up */}
          <Link to="/" className="text-secondary text-decoration-none x-small mt-3 d-block opacity-50 small">← Back to Main Site</Link>
          <Link to="/login" className="text-secondary text-decoration-none x-small mt-2 d-block opacity-50 small">Not an admin? Standard Login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;