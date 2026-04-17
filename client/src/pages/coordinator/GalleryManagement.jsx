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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [clubId]);

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
    } catch {
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
    } catch {
      alert("Delete failed.");
    }
  };

  const handleMouseEnter = (e) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.muted = true;
      video.play().catch(() => { });
    }
  };

  const handleMouseLeave = (e) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <div className="container-fluid py-4 px-3">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-white fw-bold mb-1">Club Gallery</h2>
        <p className="text-secondary mb-0">
          Manage banners, upload media and showcase your club beautifully.
        </p>
      </div>

      {/* BANNER */}
      <div className="card premium-card border-0 mb-4 overflow-hidden">
        <div className="row g-0 align-items-center">

          <div className="col-lg-8">
            {clubBanner ? (
              <img
                src={`${serverUrl}${clubBanner}`}
                className="w-100"
                style={{
                  height: "180px",
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: "20px"
                }}
                alt=""
              />
            ) : (
              <div
                className="d-flex justify-content-center align-items-center text-secondary"
                style={{ height: "260px" }}
              >
                No banner uploaded
              </div>
            )}
          </div>

          <div className="col-lg-4 p-4">
            <h5 className="text-info fw-bold mb-3">Club Banner</h5>

            <form onSubmit={handleBannerUpload}>
              <input
                type="file"
                className="form-control glass-input mb-3"
                onChange={(e) => setBannerFile(e.target.files[0])}
              />

              <button
                className="btn btn-info w-100 rounded-pill fw-bold text-dark"
                disabled={bannerUploading}
              >
                {bannerUploading ? "Uploading..." : "Upload / Update Banner"}
              </button>
            </form>
          </div>

        </div>
      </div>

      <div className="row g-4">

        {/* UPLOAD PANEL */}
        <div className="col-lg-4">
          <div className="card premium-card border-0 p-4 h-100">

            <h5 className="text-info fw-bold mb-4">Upload Media</h5>

            <form onSubmit={handleUpload}>

              <div className="mb-3">
                <label className="text-secondary small mb-2">Title</label>
                <input
                  type="text"
                  className="form-control glass-input"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="Media title"
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small mb-2">Select Event</label>
                <select
                  className="form-select glass-input"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">General Gallery</option>
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="upload-box text-center mb-4">
                <input
                  type="file"
                  id="uploadMedia"
                  className="d-none"
                  accept="image/*,video/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />

                <label htmlFor="uploadMedia" className="btn btn-outline-light rounded-pill px-4">
                  {selectedFile ? "Change File" : "Select File"}
                </label>

                {selectedFile && (
                  <div className="small text-info mt-3 text-truncate">
                    {selectedFile.name}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-info w-100 rounded-pill fw-bold text-dark"
                disabled={uploading || !selectedFile}
              >
                {uploading ? "Uploading..." : "Upload Media"}
              </button>

            </form>
          </div>
        </div>

        {/* MEDIA GRID */}
        <div className="col-lg-8">
          <div className="card premium-card border-0 p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Gallery Assets</h5>
              <span className="badge bg-info text-dark rounded-pill px-3">
                {media.length} Items
              </span>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info"></div>
              </div>
            ) : (
              <div className="row g-3">
                {media.map(item => (
                  <div className="col-md-6 col-xl-4" key={item._id}>
                    <div
                      className="gallery-card premium-media"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >

                      <div className="media-box">
                        {item.type === "image" ? (
                          <img
                            src={`${serverUrl}${item.url}`}
                            className="w-100 h-100 object-fit-cover"
                            alt=""
                          />
                        ) : (
                          <>
                            <video
                              src={`${serverUrl}${item.url}`}
                              className="w-100 h-100 object-fit-cover"
                              muted
                              loop
                              playsInline
                            />
                            <div className="play-badge">▶</div>
                          </>
                        )}
                      </div>

                      <div className="p-3">
                        <h6 className="text-white text-truncate mb-2">
                          {item.title}
                        </h6>

                        <div className="d-flex justify-content-between align-items-center">
                          {item.eventId ? (
                            <span className="badge bg-primary-subtle text-primary">
                              Linked
                            </span>
                          ) : (
                            <span className="text-secondary small">
                              General
                            </span>
                          )}

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      <style>{`
        .premium-card{
          background: linear-gradient(145deg,#0b1228,#111827);
          border-radius:22px;
          box-shadow:0 20px 40px rgba(0,0,0,.25);
        }

        .glass-input{
          background:rgba(255,255,255,.04)!important;
          border:1px solid rgba(255,255,255,.08)!important;
          color:#fff!important;
          border-radius:14px!important;
          padding:12px 14px;
        }

        .glass-input:focus{
          box-shadow:none!important;
          border-color:#0dcaf0!important;
        }

        .upload-box{
          border:2px dashed rgba(255,255,255,.12);
          border-radius:18px;
          padding:30px 20px;
          background:rgba(255,255,255,.02);
        }

        .premium-media{
          background:#0f172a;
          border-radius:20px;
          overflow:hidden;
          transition:.35s ease;
          box-shadow:0 10px 25px rgba(0,0,0,.2);
        }

        .premium-media:hover{
          transform:translateY(-8px);
          box-shadow:0 20px 35px rgba(0,0,0,.35);
        }

        .media-box{
          height:220px;
          overflow:hidden;
          position:relative;
          background:#000;
        }

        .premium-media img,
        .premium-media video{
          transition:transform .6s ease;
        }

        .premium-media:hover img,
        .premium-media:hover video{
          transform:scale(1.08);
        }

        .play-badge{
          position:absolute;
          top:12px;
          right:12px;
          width:34px;
          height:34px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:rgba(0,0,0,.6);
          color:#fff;
          font-size:12px;
        }
      `}</style>

    </div>
  );
};

export default GalleryManagement;