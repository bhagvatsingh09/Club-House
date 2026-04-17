import React, { useState, useEffect } from "react";
import API from "../../api/axios";

const GlobalGalleries = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);

  const serverUrl = "http://localhost:5000";

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/gallery/overview");
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;

    try {
      await API.delete(`/admin/gallery/media/${id}`);
      setMedia((prev) => prev.filter((m) => m._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const handleFeature = async (id) => {
    try {
      const res = await API.put(`/admin/gallery/feature/${id}`);
      setMedia((prev) =>
        prev.map((item) => (item._id === id ? res.data : item))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMedia =
    filter === "all" ? media : media.filter((m) => m.type === filter);

  return (
    <div className="container-fluid px-4 py-4 bg-dark min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">
            {selectedClub ? selectedClub.name : "Global Galleries"}
          </h2>
          <small className="text-secondary">
            Manage clubs media beautifully
          </small>
        </div>

        {selectedClub && (
          <button
            className="btn btn-outline-light rounded-pill px-4"
            onClick={() => setSelectedClub(null)}
          >
            ← Back
          </button>
        )}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info"></div>
        </div>
      ) : (
        <>
          {/* CLUB GRID */}
          {!selectedClub && (
            <div className="row g-4">
              {clubs.map((club) => (
                <div className="col-md-6 col-lg-4 col-xl-3" key={club._id}>
                  <div
                    onClick={() => fetchClubMedia(club)}
                    className="card border-0 overflow-hidden shadow-lg rounded-4 h-100"
                    style={{
                      cursor: "pointer",
                      background: "#111827",
                      transition: "0.3s"
                    }}
                  >
                    <img
                      src={
                        club.banner
                          ? `${serverUrl}${club.banner}`
                          : "https://via.placeholder.com/400x220"
                      }
                      style={{
                        height: "200px",
                        objectFit: "cover"
                      }}
                    />

                    <div className="p-3">
                      <h5 className="text-white fw-bold">{club.name}</h5>

                      <div className="d-flex justify-content-between mt-3">
                        <span className="badge bg-primary rounded-pill px-3">
                          🖼 {club.imageCount}
                        </span>

                        <span className="badge bg-danger rounded-pill px-3">
                          🎥 {club.videoCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MEDIA GRID */}
          {selectedClub && (
            <>
              {/* FILTER */}
              <div className="mb-4 d-flex gap-2 flex-wrap">
                {["all", "image", "video"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`btn rounded-pill px-4 ${
                      filter === item
                        ? "btn-info text-dark fw-bold"
                        : "btn-outline-info"
                    }`}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* MEDIA */}
              <div className="row g-3">
                {filteredMedia.map((item) => (
                  <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={item._id}>
                    <div
                      className="position-relative rounded-4 overflow-hidden shadow"
                      style={{ cursor: "pointer" }}
                    >
                      {item.type === "image" ? (
                        <img
                          src={`${serverUrl}${item.url}`}
                          onClick={() => setPreviewItem(item)}
                          style={{
                            width: "100%",
                            height: "220px",
                            objectFit: "cover"
                          }}
                        />
                      ) : (
                        <video
                          src={`${serverUrl}${item.url}`}
                          onClick={() => setPreviewItem(item)}
                          style={{
                            width: "100%",
                            height: "220px",
                            objectFit: "cover"
                          }}
                        />
                      )}

                      {/* OVERLAY */}
                      <div
                        className="position-absolute top-0 end-0 p-2 d-flex gap-2"
                      >
                        <button
                          onClick={() => handleFeature(item._id)}
                          className="btn btn-sm btn-light rounded-circle"
                        >
                          {item.isFeatured ? "❤️" : "🤍"}
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="btn btn-sm btn-danger rounded-circle"
                        >
                          🗑
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

      {/* MODAL */}
      {previewItem && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(0,0,0,0.9)",
            zIndex: 999
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{ maxWidth: "900px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            {previewItem.type === "image" ? (
              <img
                src={`${serverUrl}${previewItem.url}`}
                className="w-100 rounded-4"
              />
            ) : (
              <video
                src={`${serverUrl}${previewItem.url}`}
                controls
                autoPlay
                className="w-100 rounded-4"
              />
            )}

            <div className="text-center mt-3">
              <button
                className="btn btn-light rounded-pill px-4"
                onClick={() => setPreviewItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalGalleries;