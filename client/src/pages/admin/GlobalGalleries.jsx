import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const GlobalGalleries = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);
  const [likedId, setLikedId] = useState(null);

  const serverUrl = "http://localhost:5000";

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/gallery/overview');
      setClubs(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchClubMedia = async (club) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/gallery/${club._id}`);
      setMedia(res.data);
      setSelectedClub(club);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;

    try {
      await API.delete(`/admin/gallery/media/${id}`);
      setMedia(prev => prev.filter(m => m._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const filteredMedia =
    filter === "all" ? media : media.filter(m => m.type === filter);

  const handleFeature = async (id) => {
    try {
      const res = await API.put(`/admin/gallery/feature/${id}`);

      setMedia(prev =>
        prev.map(item =>
          item._id === id ? res.data : item
        )
      );

    } catch (err) {
      console.error("Feature update failed", err);
    }
  };

  const handleDoubleClick = async (item) => {
    // only like if not already featured
    if (item.isFeatured) return;

  setLikedId(item._id);

  setTimeout(() => setLikedId(null), 800);

    try {
      const res = await API.put(`/admin/gallery/feature/${item._id}`);

      setMedia(prev =>
        prev.map(m =>
          m._id === item._id ? res.data : m
        )
      );

    } catch (err) {
      console.error("Double click like failed", err);
    }
  };

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-white fw-bold">
          {selectedClub ? selectedClub.name : "Global Galleries"}
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info"></div>
        </div>
      ) : (
        <>
          {/* CLUB LIST */}
          {!selectedClub && (
            <div className="row g-4">
              {clubs.map(club => (
                <div className="col-md-4 col-lg-3" key={club._id}>
                  <div
                    className="card border-0 rounded-4 overflow-hidden shadow"
                    onClick={() => fetchClubMedia(club)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#0b1228"
                    }}
                  >
                    <img
                      src={
                        club.banner
                          ? `${serverUrl}${club.banner}`
                          : "https://via.placeholder.com/400x200"
                      }
                      style={{
                        height: "160px",
                        objectFit: "cover"
                      }}
                    />

                    <div className="p-3">
                      <h6 className="text-white">{club.name}</h6>

                      <div className="d-flex justify-content-between text-secondary small">
                        <span>🖼 {club.imageCount}</span>
                        <span>🎥 {club.videoCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MEDIA VIEW */}
          {selectedClub && (
            <>
              {/* FILTER BAR */}
              <div className="mb-4 d-flex align-items-center gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`btn btn-sm ${filter === "all" ? "btn-info" : "btn-outline-info"}`}
                >
                  All
                </button>

                <button
                  onClick={() => setFilter("image")}
                  className={`btn btn-sm ${filter === "image" ? "btn-info" : "btn-outline-info"}`}
                >
                  Images
                </button>

                <button
                  onClick={() => setFilter("video")}
                  className={`btn btn-sm ${filter === "video" ? "btn-info" : "btn-outline-info"}`}
                >
                  Videos
                </button>

                <button
                  className="btn btn-sm btn-secondary ms-auto"
                  onClick={() => setSelectedClub(null)}
                >
                  ← Back
                </button>

              </div>

              <div className="row g-1">
                {filteredMedia.map(item => (
                  <div className="col-4 col-md-3 col-lg-2" key={item._id}>
                    <div className="position-relative">

                      {/* MEDIA */}
                      {item.type === "image" ? (
                        <img
                          src={`${serverUrl}${item.url}`}
                          className="w-100"
                          onDoubleClick={() => handleDoubleClick(item)}
                          style={{
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "10px"
                          }}
                        />
                      ) : (
                        <video
                          src={`${serverUrl}${item.url}`}
                          className="w-100"
                          onDoubleClick={() => handleDoubleClick(item)}
                          style={{
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "10px"
                          }}
                        />
                      )}

                      {/* ACTION BUTTONS (TOP RIGHT) */}
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          display: "flex",
                          gap: "8px"
                        }}
                      >

                        {/* ❤️ LIKE */}
                        <span
                          onClick={() => handleFeature(item._id)}
                          style={{
                            fontSize: "20px",
                            cursor: "pointer",
                            background: "rgba(0,0,0,0.6)",
                            borderRadius: "50%",
                            padding: "5px 8px"
                          }}
                        >
                          {item.isFeatured ? "❤️" : "🤍"}
                        </span>

                        {/* 🗑 DELETE */}
                        <span
                          onClick={() => handleDelete(item._id)}
                          style={{
                            fontSize: "18px",
                            cursor: "pointer",
                            background: "rgba(0,0,0,0.6)",
                            borderRadius: "50%",
                            padding: "5px 8px",
                            color: "#ff4d4f"
                          }}
                        >
                          🗑
                        </span>

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.9)", zIndex: 999 }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{ maxWidth: "900px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            {previewItem.type === "image" ? (
              <img
                src={`${serverUrl}${previewItem.url}`}
                className="w-100"
                style={{ borderRadius: "10px" }}
              />
            ) : (
              <video
                src={`${serverUrl}${previewItem.url}`}
                controls
                autoPlay
                className="w-100"
                style={{ borderRadius: "10px" }}
              />
            )}

            <div className="text-white mt-2 d-flex justify-content-between">
              <span>{previewItem.title}</span>

              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(previewItem._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GlobalGalleries;