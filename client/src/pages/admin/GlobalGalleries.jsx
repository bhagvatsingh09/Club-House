import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const GlobalGalleries = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);

  const serverUrl = "http://localhost:5000";

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/gallery/overview');
      // console.log(res.data)
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
      // console.log(res.data)
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
          {/* ================= CLUB LIST ================= */}
          {!selectedClub && (
            <div className="row g-4">
              {clubs.map(club => (
                <div className="col-md-4 col-lg-3" key={club._id}>
                  <div
                    className="card bg-dark text-white border-0 shadow"
                    onClick={() => fetchClubMedia(club)}
                    style={{ cursor: "pointer" }}
                  >

                    {/* 🔥 BANNER */}
                    <img
                      src={
                        club.banner
                          ? `${serverUrl}${club.banner}`
                          : "https://via.placeholder.com/400x200"
                      }
                      style={{ height: "180px", objectFit: "cover" }}
                    />

                    <div className="p-3">
                      <h6>{club.name}</h6>
                      <small className="text-secondary">
                        🖼 {club.imageCount} | 🎥 {club.videoCount}
                      </small>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= MEDIA VIEW ================= */}
          {selectedClub && (
            <>
              {/* FILTER */}
              <div className="mb-3">
                <button onClick={() => setFilter("all")} className="btn btn-sm btn-info me-2">All</button>
                <button onClick={() => setFilter("image")} className="btn btn-sm btn-outline-info me-2">Images</button>
                <button onClick={() => setFilter("video")} className="btn btn-sm btn-outline-info">Videos</button>
                <button className="btn btn-sm btn-secondary ms-3" onClick={() => setSelectedClub(null)}>Back</button>
              </div>

              <div className="row g-3">
                {filteredMedia.map(item => (
                  <div className="col-md-4 col-lg-3" key={item._id}>
                    <div className="card bg-dark border-0 text-white">

                      {/* MEDIA */}
                      {item.type === "image" ? (
                        <img
                          src={`${serverUrl}${item.url}`}
                          className="w-100"
                          style={{ height: "180px", objectFit: "cover" }}
                          onClick={() => setPreviewItem(item)}
                        />
                      ) : (
                        <video
                          src={`${serverUrl}${item.url}`}
                          className="w-100"
                          style={{ height: "180px", objectFit: "cover" }}
                          onClick={() => setPreviewItem(item)}
                        />
                      )}

                      <div className="p-2">
                        <small>{item.title}</small>
                        <button
                          className="btn btn-sm btn-danger float-end"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
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
        <div className="modal d-block" onClick={() => setPreviewItem(null)}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content bg-dark p-3">

              {previewItem.type === "image" ? (
                <img src={`${serverUrl}${previewItem.url}`} className="w-100" />
              ) : (
                <video src={`${serverUrl}${previewItem.url}`} controls autoPlay className="w-100" />
              )}

              <h5 className="text-white mt-2">{previewItem.title}</h5>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GlobalGalleries;