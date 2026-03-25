import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const GalleryManagement = () => {
  const [media, setMedia] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [bannerFile, setBannerFile] = useState(null);
const [clubBanner, setClubBanner] = useState("");
const [bannerUploading, setBannerUploading] = useState(false);


  
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const clubId = user?.clubId;
  const serverUrl = 'http://localhost:5000';

  const fetchData = async () => {
const clubRes = await API.get(`/club`);
const currentClub = clubRes.data.find(c => c._id === clubId);
setClubBanner(currentClub?.banner || "");
    if (!clubId) return;
    try {
      const [mediaRes, eventRes] = await Promise.all([
        API.get(`/gallery/club/${clubId}`),
        API.get(`/events/club/${clubId}`)
      ]);
      setMedia(mediaRes.data);
      setEvents(eventRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = async (e) => {
  e.preventDefault();

  if (!bannerFile) return alert("Select banner image");

  const formData = new FormData();
  formData.append("banner", bannerFile);

  setBannerUploading(true);

  try {
    const res = await API.post(`/club/${clubId}/upload-banner`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setClubBanner(res.data.banner);
    setBannerFile(null);

  } catch {
    alert("Banner upload failed");
  } finally {
    setBannerUploading(false);
  }
};

  useEffect(() => { fetchData(); }, [clubId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file.");
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', mediaTitle || 'Untitled');
    if (selectedEventId) formData.append('eventId', selectedEventId);

    setUploading(true);
    try {
      await API.post(`/gallery/club/${clubId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
      setMediaTitle('');
      setSelectedEventId('');
      fetchData(); 
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media?")) return;
    try {
      await API.delete(`/gallery/${id}`);
      setMedia(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // --- HOVER LOGIC ---
  const handleMouseEnter = (e) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.muted = true; // Required for auto-play
      video.play().catch(err => console.log("Video play blocked", err));
    }
  };

  const handleMouseLeave = (e) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0; // Reset to start
    }
  };

  return (
    <div className="container-fluid p-0">

      {/* ================= CLUB BANNER ================= */}
<div className="mb-4">
  <div className="card p-3 border-0 shadow-sm" style={{ backgroundColor: '#050a18' }}>

    <h6 className="text-info mb-3">Club Banner</h6>

    {/* SHOW BANNER */}
    {clubBanner ? (
      <img
        src={`${serverUrl}${clubBanner}`}
        alt="Club Banner"
        className="w-100 rounded mb-3"
        style={{ height: "180px", objectFit: "cover" }}
      />
    ) : (
      <div className="text-secondary mb-3">No banner uploaded</div>
    )}

    {/* UPLOAD */}
    <form onSubmit={handleBannerUpload}>
      <input
        type="file"
        className="form-control mb-2 bg-dark text-white border-secondary"
        onChange={(e) => setBannerFile(e.target.files[0])}
      />

      <button
        className="btn btn-info btn-sm text-dark"
        disabled={bannerUploading}
      >
        {bannerUploading ? "Uploading..." : "Upload / Update Banner"}
      </button>
    </form>

  </div>
</div>
      
      <div className="mb-5">
        <h2 className="fw-bold text-white mb-1">Club Gallery</h2>
        <p className="text-secondary mb-0">Hover over videos to preview them.</p>
      </div>
      

      <div className="row g-4">
        {/* Upload Form */}
        <div className="col-lg-4">
          <form onSubmit={handleUpload} className="card p-4 border-0 shadow-sm" style={{ backgroundColor: '#050a18', border: '1px solid #1a203c' }}>
            <h6 className="text-info fw-bold mb-3 small">UPLOAD MEDIA</h6>
            
            <div className="mb-3">
              <label className="text-secondary small mb-1">Media Title</label>
              <input 
                type="text" className="form-control bg-dark border-secondary text-white shadow-none" 
                placeholder="Title..." value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="text-secondary small mb-1">Link to Event</label>
              <select 
                className="form-select bg-dark border-secondary text-white shadow-none"
                value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="">General Gallery</option>
                {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
              </select>
            </div>

            <div className="mb-4 text-center p-3 border border-secondary border-dashed rounded-3">
              <input type="file" className="d-none" id="galleryUpload" accept="image/*,video/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
              <label htmlFor="galleryUpload" className="btn btn-outline-light btn-sm px-4 rounded-pill">
                {selectedFile ? 'Change File' : 'Select File'}
              </label>
              {selectedFile && <div className="text-info small mt-2 text-truncate">{selectedFile.name}</div>}
            </div>

            <button type="submit" className="btn btn-info w-100 fw-bold text-dark rounded-pill" disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>

        {/* Media Grid */}
        <div className="col-lg-8">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-info"></div></div>
          ) : (
            <div className="row g-3">
              {media.map((item) => (
                <div className="col-md-6 col-xl-4" key={item._id}>
                  <div 
                    className="card bg-dark border-0 rounded-4 overflow-hidden shadow-sm h-100 gallery-card"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div style={{ height: '180px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                      {item.type === 'image' ? (
                        <img 
                          src={`${serverUrl}${item.url}`} 
                          className="w-100 h-100 object-fit-cover transition-all" 
                          alt={item.title} 
                          style={{ transition: 'transform 0.5s ease' }}
                        />
                      ) : (
                        <>
                          <video 
                            src={`${serverUrl}${item.url}`} 
                            className="w-100 h-100 object-fit-cover"
                            loop
                            muted
                            playsInline
                          />
                          <div className="position-absolute top-2 end-2 bg-dark bg-opacity-50 text-white rounded-circle p-1" style={{ width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                            ▶
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="p-3" style={{ background: '#0a1128' }}>
                      <h6 className="text-white small mb-1 text-truncate">{item.title}</h6>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        {item.eventId ? (
                          <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '10px' }}>Linked</span>
                        ) : (
                          <span className="text-secondary" style={{ fontSize: '10px' }}>General</span>
                        )}
                        <button onClick={() => handleDelete(item._id)} className="btn btn-sm text-danger p-0" style={{ fontSize: '12px' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .gallery-card:hover img {
          transform: scale(1.1);
        }
        .gallery-card {
          transition: transform 0.3s ease;
        }
        .gallery-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default GalleryManagement;