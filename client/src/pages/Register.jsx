import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
    studentId: '',
    department: '',
    year: '',
    phone: '',
    designation: '',
    bio: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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

          {/* Name */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">FULL NAME</label>
            <input
              type="text"
              name="name"
              required
              className="form-control bg-dark border-secondary text-white py-2"
              placeholder="Enter your name"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">COLLEGE EMAIL</label>
            <input
              type="email"
              name="email"
              required
              className="form-control bg-dark border-secondary text-white py-2"
              placeholder="email@university.edu"
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">PHONE NUMBER</label>
            <input
              type="text"
              name="phone"
              className="form-control bg-dark border-secondary text-white py-2"
              placeholder="Enter phone number"
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">IDENTIFY AS</label>
            <select
              name="role"
              className="form-select bg-dark border-secondary text-white py-2"
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty Coordinator</option>
            </select>
          </div>

          {/* ================= STUDENT FIELDS ================= */}
          {formData.role === 'student' && (
            <>
              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">STUDENT ID</label>
                <input
                  type="text"
                  name="studentId"
                  className="form-control bg-dark border-secondary text-white py-2"
                  placeholder="Enter Student ID"
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">DEPARTMENT</label>
                <input
                  type="text"
                  name="department"
                  className="form-control bg-dark border-secondary text-white py-2"
                  placeholder="e.g. BCA, B.Tech"
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">YEAR</label>
                <select
                  name="year"
                  className="form-select bg-dark border-secondary text-white py-2"
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </>
          )}

          {/* ================= FACULTY FIELDS ================= */}
          {formData.role === 'faculty' && (
            <>
              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">DEPARTMENT</label>
                <input
                  type="text"
                  name="department"
                  className="form-control bg-dark border-secondary text-white py-2"
                  placeholder="Department"
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">DESIGNATION</label>
                <input
                  type="text"
                  name="designation"
                  className="form-control bg-dark border-secondary text-white py-2"
                  placeholder="e.g. Professor, HOD"
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* Bio */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">BIO (Optional)</label>
            <textarea
              name="bio"
              className="form-control bg-dark border-secondary text-white py-2"
              rows="2"
              placeholder="Short description"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-white small fw-bold mb-2">PASSWORD</label>
            <input
              type="password"
              name="password"
              required
              className="form-control bg-dark border-secondary text-white py-2"
              placeholder="Min. 8 characters"
              onChange={handleChange}
            />
          </div>

          <button
            className="btn btn-info w-100 py-3 rounded-pill fw-bold text-dark shadow-sm mb-4"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-secondary small">
            Already have an account?
            <Link to="/login" className="text-info text-decoration-none fw-bold ms-1">
              Login Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;