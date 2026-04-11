import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';

const ManageClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [showHeadModal, setShowHeadModal] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '', category: 'Technical' });
  const [faculties, setFaculties] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const fetchClubs = async () => {
    try {
      const response = await API.get('/admin/all-clubs');
      setClubs(response.data);
      setFilteredClubs(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    let result = clubs;

    if (activeCategory !== 'All') {
      result = result.filter(c => c.category === activeCategory);
    }

    if (searchTerm) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClubs(result);
  }, [searchTerm, activeCategory, clubs]);

  const handleAssignHead = async (facultyId) => {
    setAssigning(true);
    try {
      await API.put(`/admin/assign-head/${selectedClub._id}`, { facultyId });
      setShowHeadModal(false);
      fetchClubs();
    } catch (err) {
      alert("Assignment Failed");
    } finally {
      setAssigning(false);
    }
  };

  // ⭐ REMOVE HEAD FUNCTION
  const handleRemoveHead = async (clubId) => {
    if (!window.confirm("Remove this faculty from this club?")) return;

    try {
      await API.put(`/admin/remove-head/${clubId}`);
      fetchClubs(); // refresh club list
    } catch (err) {
      alert("Failed to remove head");
    }
  };
  const handleCreateClub = async (e) => {
    e.preventDefault();

    // console.log("isEdit:", isEdit);
    // console.log("selectedClub:", selectedClub);
    // console.log("formData:", formData);

    try {
      if (isEdit) {
        await API.put(`/admin/update-club/${selectedClub._id}`, formData);
      } else {
        await API.post('/admin/create-club', formData);
      }

      setShowModal(false);
      setIsEdit(false);
      setSelectedClub(null);

      setFormData({ name: '', description: '', category: 'Technical' });

      fetchClubs();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const [isEdit, setIsEdit] = useState(false);

  // for delete

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;

    try {
      await API.delete(`/admin/delete-club/${clubId}`);
      toast.success("Club deleted successfully");
      fetchClubs();
    } catch (err) {
      toast.error("Failed to delete club");
    }
  };

  // club details
  const [viewClub, setViewClub] = useState(null);
  const [clubDetails, setClubDetails] = useState(null);

  // featch details
  const fetchClubDetails = async (clubId) => {
    try {
      const res = await API.get(`/admin/club-details/${clubId}`);
      // console.log(res.data);
      setClubDetails(res.data);
      setViewClub(clubId);
    } catch (err) {
      alert("Failed to load club details");
    }
  };



  return (
    <div className="container-fluid py-3">

      {viewClub && clubDetails && (
        <div className="card p-4 mb-4 rounded-4 border-0" style={{ backgroundColor: '#0a1128' }}>

          <div className="d-flex justify-content-between mb-4">
            <h4 className="text-white fw-bold">{clubDetails.name}</h4>

            <button
              className="btn btn-outline-light"
              onClick={() => {
                setViewClub(null);
                setClubDetails(null);
              }}
            >
              ← Back
            </button>
          </div>

          {/* MEMBERS */}
          <h5 className="text-info mb-3">
            Members ({clubDetails.members?.length || 0})
          </h5>

          <div className="table-responsive mb-4">
            <table className="table table-dark table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>

                {/* ⭐ HEAD FIRST */}
                {clubDetails.headCoordinator && (
                  <tr>
                    <td className="text-warning fw-bold">
                      {clubDetails.headCoordinator.name}
                    </td>
                    <td className="text-warning small">
                      {clubDetails.headCoordinator.email}
                    </td>
                    <td className="text-warning small fw-semibold">
                      Head Coordinator
                    </td>
                  </tr>
                )}

                {/* ⭐ VOLUNTEERS */}
                {clubDetails.members
                  ?.filter(m => m.clubRole === "Volunteer")
                  .map(v => (
                    <tr key={v._id}>
                      <td className="text-white">{v.name}</td>
                      <td className="text-info small">{v.email}</td>
                      <td colSpan="3" className="text-info fw-bold small pt-3">
                        Volunteer
                      </td>
                    </tr>
                  ))
                }

                {/* ⭐ MEMBERS */}
                {clubDetails.members
                  ?.filter(m => m.clubRole !== "Volunteer")
                  .map(m => (
                    <tr key={m._id}>
                      <td className="text-white">{m.name}</td>
                      <td className="text-info small">{m.email}</td>
                      <td colSpan="3" className="text-secondary fw-bold small pt-3">
                        Member
                      </td>
                    </tr>
                  ))
                }

                {/* EMPTY STATE */}
                {(!clubDetails.members || clubDetails.members.length === 0) && (
                  <tr>
                    <td colSpan="3" className="text-center text-secondary">
                      No members found
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* EVENTS */}
          <h5 className="text-info mb-3">Events</h5>
          <div className="d-flex flex-wrap gap-3">
            {clubDetails.events?.length > 0 ? (
              clubDetails.events.map(e => (
                <div
                  key={e._id}
                  className="p-3 rounded border border-secondary text-white"
                  style={{
                    backgroundColor: '#1f2937', // slightly lighter dark card
                    minWidth: '200px',
                    maxWidth: '250px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={event => {
                    event.currentTarget.style.transform = 'scale(1.07)';
                    event.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={event => {
                    event.currentTarget.style.transform = 'scale(1)';
                    event.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                  }}
                >
                  <div className="fw-bold fs-5 text-info">{e.title}</div>
                  {e.date && <div className="text-warning small mt-1">{new Date(e.date).toLocaleDateString()}</div>}
                  {e.participants && (
                    <div className="text-success small mt-1">{e.participants.length} participants</div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-secondary">No events</p>
            )}
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="row mb-5 align-items-center">
        <div className="col-md-4">
          <h2 className="fw-bold text-white mb-0">Club Management</h2>
          <p className="text-secondary small">Oversee {clubs.length} campus organizations</p>
        </div>

        <div className="col-md-5">
          <div className="input-group bg-dark rounded-pill border border-secondary px-3">
            <span className="input-group-text bg-transparent border-0 text-secondary">🔍</span>
            <input
              type="text"
              className="form-control bg-transparent border-0 text-white shadow-none"
              placeholder="Search clubs..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-3 text-end">
          <button
            className="btn btn-info px-4 rounded-pill fw-bold text-dark shadow-sm"
            onClick={() => setShowModal(true)}
          >
            + Register Club
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {['All', 'Technical', 'Cultural', 'Sports', 'Other'].map(cat => (
          <button
            key={cat}
            className={`btn btn-sm rounded-pill px-4 ${activeCategory === cat
              ? 'btn-info text-dark'
              : 'btn-outline-secondary text-white'
              }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CLUB GRID */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info"></div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredClubs.map(club => (
            <div className="col-xl-4 col-md-6" key={club._id}>
              <div
                className="card h-100 border-0 rounded-4"
                style={{ backgroundColor: '#0a1128', border: '1px solid #1a203c' }}
              >
                <div className="card-body p-4">

                  <div className="d-flex justify-content-between mb-3">
                    <span className="badge bg-info bg-opacity-10 text-info">
                      {club.category}
                    </span>

                  </div>

                  <h4 className="text-white fw-bold mb-2">{club.name}</h4>

                  <p
                    className="text-secondary small mb-4"
                    style={{ height: '40px', overflow: 'hidden' }}
                  >
                    {club.description}
                  </p>

                  {/* HEAD COORDINATOR */}
                  <div className="bg-dark bg-opacity-50 rounded-3 p-3 mb-3 border border-secondary border-opacity-10">
                    <label className="text-secondary x-small fw-bold text-uppercase d-block mb-1">
                      Head Coordinator
                    </label>

                    <div className="d-flex justify-content-between align-items-center">

                      <div className="d-flex align-items-center">
                        <div
                          className={`rounded-circle me-2 ${club.headCoordinator ? 'bg-success' : 'bg-danger'
                            }`}
                          style={{ width: '8px', height: '8px' }}
                        ></div>

                        <span className="text-white small fw-bold">
                          {club.headCoordinator?.name || 'Vacant'}
                        </span>
                      </div>
                      <button
                        className="btn btn-warning btn-sm rounded-pill px-3 me-2"
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedClub(club);
                          setFormData({
                            name: club.name,
                            description: club.description,
                            category: club.category
                          });
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>

                      

                      <button
                        className="btn btn-danger btn-sm rounded-pill px-3"
                        onClick={() => handleDeleteClub(club._id)}
                      >
                        Delete
                      </button>

                    </div>
                  </div>

                  {/* ASSIGN / REMOVE HEAD BUTTON */}
                  <button
                    className={`btn w-100 rounded-pill fw-bold btn-sm mt-2 ${club.headCoordinator ? 'btn-danger' : 'btn-outline-info text-dark'
                      }`}
                    onClick={() => {
                      if (club.headCoordinator) {
                        // Remove head
                        handleRemoveHead(club._id);
                      } else {
                        // Assign head
                        setSelectedClub(club);
                        API.get('/admin/faculty-coordinators').then(res => setFaculties(res.data));
                        setShowHeadModal(true);
                      }
                    }}
                  >
                    {club.headCoordinator ? 'Remove' : 'Assign Head'}
                  </button>
                  <button
                    className="btn btn-outline-light w-100 rounded-pill fw-bold btn-sm mt-2"
                    onClick={() => fetchClubDetails(club._id)}
                  >
                    View Details
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGN HEAD MODAL */}
      {showHeadModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4" style={{ backgroundColor: '#050a18' }}>
              <div className="modal-header border-dark p-4">
                <h5 className="text-white fw-bold m-0">
                  Assign Head: {selectedClub?.name}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowHeadModal(false)}
                ></button>
              </div>

              <div className="modal-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {faculties.map(f => (
                  <div
                    key={f._id}
                    className={`d-flex justify-content-between align-items-center p-3 border-bottom border-dark ${f.isAssigned ? 'opacity-50' : ''
                      }`}
                  >
                    <div>
                      <div className="text-white fw-bold small">{f.name}</div>
                      <div className="text-secondary x-small">{f.email}</div>

                      {f.isAssigned && (
                        <div className="text-warning x-small mt-1">
                          Leading: {f.clubName}
                        </div>
                      )}
                    </div>

                    <button
                      className={`btn btn-sm rounded-pill px-3 ${f.isAssigned
                        ? 'btn-dark disabled'
                        : 'btn-info text-dark fw-bold'
                        }`}
                      onClick={() => handleAssignHead(f._id)}
                      disabled={f.isAssigned || assigning}
                    >
                      {assigning ? '...' : 'Assign'}
                    </button>

                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CLUB MODAL */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4" style={{ backgroundColor: '#050a18' }}>

              <div className="modal-header border-dark p-4">
                <h5 className="text-white fw-bold m-0">
                  {isEdit ? "Edit Club" : "Register New Club"}
                </h5>
                <button type="submit" className="btn btn-info rounded-pill fw-bold text-dark">
                  {isEdit ? "Update Club" : "Create Club"}
                </button>
              </div>

              <form onSubmit={handleCreateClub}>
                <div className="modal-body p-4">

                  <div className="mb-3">
                    <label className="text-white small fw-bold">CLUB NAME</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-white small fw-bold">CATEGORY</label>
                    <select
                      className="form-select bg-dark border-secondary text-white"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="text-white small fw-bold">DESCRIPTION</label>
                    <textarea
                      className="form-control bg-dark border-secondary text-white"
                      rows="3"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>

                </div>

                <div className="modal-footer border-dark">
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill"
                    onClick={() => {
                      setIsEdit(false);
                      setFormData({ name: '', description: '', category: 'Technical' });
                      setShowModal(true);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-info rounded-pill fw-bold text-dark"
                  >
                    Create Club
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>

  );
};

export default ManageClubs;