import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

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

  return (
    <div className="container-fluid py-3">

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
            className={`btn btn-sm rounded-pill px-4 ${
              activeCategory === cat
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
                          className={`rounded-circle me-2 ${
                            club.headCoordinator ? 'bg-success' : 'bg-danger'
                          }`}
                          style={{ width: '8px', height: '8px' }}
                        ></div>

                        <span className="text-white small fw-bold">
                          {club.headCoordinator?.name || 'Vacant'}
                        </span>
                      </div>

                      {club.headCoordinator && (
                        <button
                          className="btn btn-danger btn-sm rounded-pill px-3"
                          onClick={() => handleRemoveHead(club._id)}
                        >
                          Remove
                        </button>
                      )}

                    </div>
                  </div>

                  <button
                    className="btn btn-outline-info w-100 rounded-pill fw-bold btn-sm py-2"
                    onClick={() => {
                      setSelectedClub(club);
                      API.get('/admin/faculties')
                        .then(res => setFaculties(res.data));
                      setShowHeadModal(true);
                    }}
                  >
                    {club.headCoordinator ? 'Change Head' : 'Assign Head'}
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
                    className={`d-flex justify-content-between align-items-center p-3 border-bottom border-dark ${
                      f.isAssigned ? 'opacity-50' : ''
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
                      className={`btn btn-sm rounded-pill px-3 ${
                        f.isAssigned
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

    </div>
  );
};

export default ManageClubs;