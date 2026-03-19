import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', branch: '' });

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?._id || storedUser?.id;

  // List of departments for the dropdown
  const departments = [
    "Computer Science", "Information Technology", "Electronics", 
    "Mechanical", "Civil", "Electrical", "Business Administration"
  ];

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/users/${userId}`);
      setProfile(res.data);
      setFormData({ 
        name: res.data.name, 
        bio: res.data.bio || '', 
        branch: res.data.branch || '' 
      });
    } catch (err) {
      toast.error("Could not load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await API.put(`/users/${userId}/update`, formData);
      setProfile(res.data.user);
      setIsEditing(false);
      toast.success("Profile updated!");
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data.user }));
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  if (loading) return <div className="text-center p-5 mt-5"><div className="spinner-border text-info"></div></div>;

  return (
    <div className="container-fluid p-0">
      <div className="rounded-4 overflow-hidden mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #5d78ff 100%)', height: '150px' }}></div>

      <div className="row px-3">
        <div className="col-lg-4" style={{ marginTop: '-80px' }}>
          <div className="card shadow-lg border-0 rounded-4 p-4 mb-4" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
            <div className="text-center mb-3">
              <img 
                src={`https://ui-avatars.com/api/?name=${profile.name}&background=5d78ff&color=fff&size=128`} 
                alt="Profile" 
                className="rounded-circle border border-4 border-dark shadow-lg mb-3"
                style={{ width: '120px', height: '120px' }}
              />
              {isEditing ? (
                <input 
                  className="form-control form-control-sm bg-dark text-white border-secondary text-center"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your Name"
                />
              ) : (
                <h4 className="fw-bold text-white mb-0">{profile.name}</h4>
              )}
              <p className="text-info small fw-semibold mt-1">{profile.roll || 'STUDENT'}</p>
            </div>

            <hr className="border-secondary opacity-25" />

            <div className="mt-3">
              <label className="text-secondary x-small text-uppercase fw-bold mb-1">About Me</label>
              {isEditing ? (
                <textarea 
                  className="form-control bg-dark text-white border-secondary small"
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-light small opacity-75">{profile.bio || "No bio added yet."}</p>
              )}
            </div>

            <div className="mt-4">
              {isEditing ? (
                <button className="btn btn-success w-100 py-2 fw-bold rounded-pill mb-2" onClick={handleUpdate}>Save Changes</button>
              ) : (
                <button className="btn btn-info w-100 py-2 fw-bold text-dark rounded-pill mb-2" onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}
              <button className="btn btn-outline-danger w-100 py-2 rounded-pill small" onClick={() => setIsEditing(false)}>
                {isEditing ? 'Cancel' : 'Deactivate Account'}
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-lg border-0 rounded-4 p-4 mb-4" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
            <h5 className="fw-bold text-white mb-4">Academic Details</h5>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="text-secondary small mb-1">Department / Branch</label>
                {isEditing ? (
                  <select 
                    className="form-select bg-dark text-white border-secondary"
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  >
                    <option value="">Select Branch</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-3 text-white border border-secondary border-opacity-25" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {profile.branch || "Not Specified"}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="text-secondary small mb-1">Email Address</label>
                <div className="p-3 rounded-3 text-white border border-secondary border-opacity-25 opacity-50" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {profile.email}
                </div>
              </div>
              <div className="col-md-6">
                <label className="text-secondary small mb-1">Member Since</label>
                <div className="p-3 rounded-3 text-white border border-secondary border-opacity-25" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;