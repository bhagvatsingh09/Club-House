import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // console.log(formData)
      await API.post('/auth/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#050a18' }}>
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5" style={{ maxWidth: '500px', width: '100%', backgroundColor: '#0a1128', border: '1px solid #1a203c' }}>
        
        <div className="text-center mb-4">
          <h2 className="fw-bold text-info mb-2">Create Account</h2>
          <p className="text-secondary small">Join the campus club community</p>
          {error && <div className="alert alert-danger py-2 small border-0 shadow-sm">{error}</div>}
        </div>

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">FULL NAME</label>
            <input 
              type="text" required className="form-control bg-dark border-secondary text-white py-2 shadow-none" 
              placeholder="Enter your name" style={{ borderColor: '#1a203c' }}
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">COLLEGE EMAIL</label>
            <input 
              type="email" required className="form-control bg-dark border-secondary text-white py-2 shadow-none" 
              placeholder="email@university.edu" style={{ borderColor: '#1a203c' }}
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">IDENTIFY AS</label>
            <select className="form-select bg-dark border-secondary text-white py-2 shadow-none" 
              style={{ borderColor: '#1a203c' }}
              onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="student">Student</option>
              <option value="faculty">Faculty Coordinator</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-white small fw-bold mb-2">PASSWORD</label>
            <input 
              type="password" required className="form-control bg-dark border-secondary text-white py-2 shadow-none" 
              placeholder="Min. 8 characters" style={{ borderColor: '#1a203c' }}
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <button className="btn btn-info w-100 py-3 rounded-pill fw-bold text-dark shadow-sm mb-4" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-secondary small">
            Already have an account? <Link to="/login" className="text-info text-decoration-none fw-bold ms-1">Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;