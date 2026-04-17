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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    const {
      name,
      email,
      phone,
      password,
      role,
      studentId,
      department,
      year,
      designation
    } = formData;

    // Full Name
    if (!name.trim()) return "Full name is required";
    if (!/^[A-Za-z\s]+$/.test(name))
      return "Name should contain only letters";

    // Email
    if (!email.trim()) return "Email is required";
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in|com)$/i.test(email))
      return "Enter a valid email address";

    // Phone
    if (!phone.trim()) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(phone))
      return "Enter valid 10 digit phone number";

    // Password
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters";

    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain one uppercase letter";

    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain one lowercase letter";

    if (!/(?=.*\d)/.test(password))
      return "Password must contain one number";

    // Department
    if (!department) return "Please select department";

    // Student Validation
    if (role === "student") {
      if (!studentId.trim()) return "Student ID is required";

      if (!/^[A-Za-z0-9-]+$/.test(studentId))
        return "Invalid Student ID";

      if (!year) return "Please select year";
    }

    // Faculty Validation
    if (role === "faculty") {
      if (!designation.trim())
        return "Designation is required";
    }

    return "";
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await API.post('/auth/register', formData);

      alert("Registration Successful! Please Login.");
      navigate('/login');

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#050a18' }}>
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5" style={{ maxWidth: '500px', width: '100%', backgroundColor: '#0a1128' }}>

        <div className="text-center mb-4">
          <h2 className="fw-bold text-info mb-2">Create Account</h2>
          <p className="text-secondary small">Join the campus club community</p>

          {error && (
            <div className="alert alert-danger py-2 small">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">FULL NAME</label>
            <input
              type="text"
              name="name"
              className="form-control bg-dark border-secondary text-white"
              placeholder="Enter your name"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">EMAIL</label>
            <input
              type="email"
              name="email"
              className="form-control bg-dark border-secondary text-white"
              placeholder="Enter email"
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">PHONE</label>
            <input
              type="text"
              name="phone"
              className="form-control bg-dark border-secondary text-white"
              placeholder="Enter phone number"
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">ROLE</label>
            <select
              name="role"
              className="form-select bg-dark border-secondary text-white"
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {/* Student Fields */}
          {formData.role === "student" && (
            <>
              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">STUDENT ID</label>
                <input
                  type="text"
                  name="studentId"
                  className="form-control bg-dark border-secondary text-white"
                  placeholder="Student ID"
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">DEPARTMENT</label>
                <select
                  name="department"
                  className="form-select bg-dark border-secondary text-white"
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="B.COM">B.COM</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">YEAR</label>
                <select
                  name="year"
                  className="form-select bg-dark border-secondary text-white"
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                </select>
              </div>
            </>
          )}

          {/* Faculty Fields */}
          {formData.role === "faculty" && (
            <>
              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">DEPARTMENT</label>
                <select
                  name="department"
                  className="form-select bg-dark border-secondary text-white"
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="B.COM">B.COM</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="text-white small fw-bold mb-2">
                  DESIGNATION
                </label>

                <select
                  name="designation"
                  className="form-select bg-dark border-secondary text-white py-2"
                  onChange={handleChange}
                >
                  <option value="">Select Designation</option>
                  <option value="Professor">Professor</option>
                  <option value="Assistant Professor">
                    Assistant Professor
                  </option>
                </select>
              </div>
            </>
          )}

          {/* Bio */}
          <div className="mb-3">
            <label className="text-white small fw-bold mb-2">
              BIO (Optional)
            </label>

            <textarea
              name="bio"
              rows="2"
              className="form-control bg-dark border-secondary text-white"
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
              className="form-control bg-dark border-secondary text-white"
              placeholder="Strong password"
              onChange={handleChange}
            />
          </div>

          <button
            className="btn btn-info w-100 rounded-pill fw-bold text-dark"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-secondary small">
            Already have account?
            <Link to="/login" className="text-info ms-1 text-decoration-none fw-bold">
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;