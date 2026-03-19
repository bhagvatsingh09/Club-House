import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Login = () => {
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'Admin') navigate('/admin/dashboard');
      else if (data.user.role === 'Faculty') navigate('/coord/dashboard');
      else navigate('/user/dashboard');
      
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
          <h2 className="fw-bold text-info mb-2">Welcome Back</h2>
          <p className="text-secondary small">Login to manage your club activities</p>
          {error && <div className="alert alert-danger py-2 small border-0 shadow-sm">{error}</div>}
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">EMAIL ADDRESS</label>
            <input 
              type="email" required className="form-control bg-dark border-secondary text-white py-2 shadow-none" 
              placeholder="name@college.edu" style={{ borderColor: '#1a203c' }}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="mb-4">
            <label className="text-white small fw-bold mb-2">PASSWORD</label>
            <input 
              type="password" required className="form-control bg-dark border-secondary text-white py-2 shadow-none" 
              placeholder="••••••••" style={{ borderColor: '#1a203c' }}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button className="btn btn-info w-100 py-3 rounded-pill fw-bold text-dark shadow-sm mb-4" type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'SIGN IN'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-secondary small">
            New to ClubHub? <Link to="/register" className="text-info text-decoration-none fw-bold ms-1">Create an account</Link>
          </p>
          <Link to="/" className="text-secondary text-decoration-none x-small mt-3 d-block opacity-50 small">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;