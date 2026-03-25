import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    branch: '',
    rollNo: '',
    photo: ''
  });

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?._id || storedUser?.id;

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
        branch: res.data.branch || '',
        rollNo: res.data.rollNo || '',
        photo: res.data.photo || ''
      });

      const regRes = await API.get(`/users/${userId}/registrations`);
      setRegistrations(regRes.data);

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
    } catch {
      toast.error("Update failed.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="text-center p-5 text-info">Loading...</div>;

  return (
    <div className="container-fluid p-4 text-white">

      {/* HEADER */}
      <div className="card p-4 mb-4 bg-dark border-secondary shadow">
        <div className="d-flex align-items-center gap-4">

          <img
            src={formData.photo || `https://ui-avatars.com/api/?name=${profile.name}`}
            className="rounded-circle border border-info"
            style={{ width: "90px", height: "90px", objectFit: "cover" }}
          />

          <div>
            <h3 className="text-info">{profile.name}</h3>
            <p className="text-light mb-1">{profile.email}</p>
            <p className="text-secondary mb-0">
              🎓 {profile.branch || "No branch"} | 🆔 {profile.rollNo || "N/A"}
            </p>
          </div>

        </div>
      </div>

      {/* STATS */}
      <div className="row mb-4">

        <div className="col-md-4">
          <div className="card bg-dark border-secondary p-3 text-center">
            <h4 className="text-info">{profile.joinedClubs?.length || 0}</h4>
            <p className="text-light mb-0">Clubs Joined</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-dark border-secondary p-3 text-center">
            <h4 className="text-success">{registrations.length}</h4>
            <p className="text-light mb-0">Events Participated</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-dark border-secondary p-3 text-center">
            <h4 className="text-warning">
              {registrations.filter(r => r.status === "approved").length}
            </h4>
            <p className="text-light mb-0">Approved Events</p>
          </div>
        </div>

      </div>

      <div className="row">

        {/* LEFT PROFILE */}
        <div className="col-lg-4">
          <div className="card bg-dark border-secondary p-3 mb-4">

            <h5 className="text-info mb-3">Profile Info</h5>

            {isEditing ? (
              <>
                <input
                  className="form-control mb-2 bg-dark text-white border-secondary"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Name"
                />

                <input
                  className="form-control mb-2 bg-dark text-white border-secondary"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                  placeholder="Roll Number / Enrollment No"
                />

                <textarea
                  className="form-control mb-2 bg-dark text-white border-secondary"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Bio"
                />

                <select
                  className="form-select bg-dark text-white border-secondary mb-2"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                >
                  <option>Select Branch</option>
                  {departments.map(d => <option key={d}>{d}</option>)}
                </select>

                {/* IMAGE UPLOAD */}
                <input
                  type="file"
                  className="form-control mb-2 bg-dark text-white border-secondary"
                  onChange={handleImageChange}
                />
              </>
            ) : (
              <>
                <p><span className="text-secondary">Branch:</span> <span className="text-light">{profile.branch || "N/A"}</span></p>
                <p><span className="text-secondary">Roll No:</span> <span className="text-light">{profile.rollNo || "N/A"}</span></p>
                <p><span className="text-secondary">Bio:</span> <span className="text-light">{profile.bio || "No bio"}</span></p>
              </>
            )}

            <button
              className="btn btn-info mt-2 w-100"
              onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-lg-8">

          {/* EVENTS */}
          <div className="card bg-dark border-secondary p-3 mb-4">
            <h5 className="text-info mb-3">My Events</h5>

            {registrations.length === 0 ? (
              <p className="text-secondary">No events participated</p>
            ) : (
              registrations.map(reg => (
                <div key={reg._id} className="border-bottom pb-2 mb-2">

                  <h6 className="text-light">{reg.eventId?.title}</h6>

                  <p className="text-secondary small mb-1">
                    📍 {reg.clubId?.name}
                  </p>

                  <span className={`badge ${
                    reg.status === "approved"
                      ? "bg-success"
                      : "bg-warning text-dark"
                  }`}>
                    {reg.status}
                  </span>

                </div>
              ))
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;