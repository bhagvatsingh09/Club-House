import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const GlobalGalleries = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState('all'); // all, image, video
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null); // For Lightbox

  // Fetch Club Overviews
  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/gallery/overview');
      setClubs(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Fetch Media for Selected Club
  const fetchClubMedia = async (club) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/gallery/${club._id}`);
      setMedia(res.data);
      setSelectedClub(club);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchOverview(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this asset permanently?")) {
      try {
        await API.delete(`/admin/gallery/media/${id}`);
        setMedia(media.filter(m => m._id !== id));
      } catch (err) { alert("Delete failed"); }
    }
  };

  const filteredMedia = filter === 'all' ? media : media.filter(m => m.type === filter);

  return (
    <div className="container-fluid">
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold text-white">
            {selectedClub ? `Gallery: ${selectedClub.name}` : "Global Club Galleries"}
          </h2>
          <p className="text-secondary mb-0">
            {selectedClub ? `Managing ${media.length} assets` : "Audit and manage media across all campus clubs."}
          </p>
        </div>
        
        {selectedClub ? (
          <div className="btn-group bg-dark rounded-pill p-1 shadow">
            <button className={`btn btn-sm rounded-pill px-3 ${filter === 'all' ? 'btn-info text-dark' : 'btn-outline-secondary border-0 text-white'}`} onClick={() => setFilter('all')}>All</button>
            <button className={`btn btn-sm rounded-pill px-3 ${filter === 'image' ? 'btn-info text-dark' : 'btn-outline-secondary border-0 text-white'}`} onClick={() => setFilter('image')}>Photos</button>
            <button className={`btn btn-sm rounded-pill px-3 ${filter === 'video' ? 'btn-info text-dark' : 'btn-outline-secondary border-0 text-white'}`} onClick={() => setFilter('video')}>Videos</button>
            <button className="btn btn-sm btn-link text-secondary text-decoration-none ms-2" onClick={() => {setSelectedClub(null); setFilter('all'); fetchOverview();}}>Back</button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-info"></div></div>
      ) : (
        <>
          {/* --- VIEW 1: CLUB LIST GRID --- */}
          {!selectedClub && (
            <div className="row g-4">
              {clubs.map(club => (
                <div className="col-lg-3 col-md-6" key={club._id}>
                  <div 
                    className="card border-0 rounded-4 overflow-hidden position-relative group cursor-pointer shadow-lg"
                    style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}
                    onClick={() => fetchClubMedia(club)}
                  >
                    <img src={club.cover} className="card-img-top opacity-50" style={{ height: '180px', objectFit: 'cover' }} alt="" />
                    <div className="card-body p-3">
                      <h6 className="text-white fw-bold mb-1">{club.name}</h6>
                      <div className="d-flex justify-content-between text-secondary x-small">
                        <span>🖼️ {club.imageCount} Photos</span>
                        <span>🎥 {club.videoCount} Videos</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- VIEW 2: SPECIFIC MEDIA GRID --- */}
          {selectedClub && (
            <div className="row g-3">
              {filteredMedia.map(item => (
                <div className="col-lg-3 col-md-4 col-6" key={item._id}>
                  <div className="card border-0 rounded-3 overflow-hidden position-relative group shadow" style={{ height: '200px', backgroundColor: '#000' }}>
                    <img 
                      src={item.type === 'image' ? item.url : 'https://placehold.co/400x300/000/white?text=Video+File'} 
                      className="w-100 h-100 object-fit-cover cursor-pointer" 
                      alt={item.title}
                      onClick={() => setPreviewItem(item)}
                    />
                    
                    <div className="position-absolute top-0 end-0 p-2 opacity-0 group-hover-visible transition">
                      <button className="btn btn-danger btn-sm rounded-circle shadow" onClick={() => handleDelete(item._id)}>🗑️</button>
                    </div>

                    <div className="position-absolute bottom-0 w-100 p-2 text-white x-small fw-bold" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                      <span className="badge bg-dark bg-opacity-50 me-1">{item.type === 'image' ? 'IMG' : 'VID'}</span>
                      {item.title}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* --- ADD MEDIA PLACEHOLDER --- */}
              <div className="col-lg-3 col-md-4 col-6">
                <div className="card border-1 rounded-3 h-100 d-flex align-items-center justify-content-center text-info border-info border-opacity-25" style={{ backgroundColor: 'rgba(13, 202, 240, 0.05)', borderStyle: 'dashed', cursor: 'pointer' }}>
                  <div className="text-center">
                    <div className="fs-2">+</div>
                    <div className="x-small fw-bold">Upload Asset</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- LIGHTBOX MODAL --- */}
      {previewItem && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }} onClick={() => setPreviewItem(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-transparent border-0">
              <div className="text-end mb-2">
                <button className="btn-close btn-close-white shadow-none" onClick={() => setPreviewItem(null)}></button>
              </div>
              {previewItem.type === 'image' ? (
                <img src={previewItem.url} className="img-fluid rounded shadow-lg" alt="" />
              ) : (
                <div className="ratio ratio-16x9">
                  <video src={previewItem.url} controls autoPlay className="rounded shadow-lg"></video>
                </div>
              )}
              <h4 className="text-white mt-3 text-center fw-bold">{previewItem.title}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalGalleries;