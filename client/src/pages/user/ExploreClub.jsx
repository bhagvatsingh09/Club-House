import React, { useState, useEffect, useMemo } from "react";
import API from "../../api/axios";
import { toast } from "react-hot-toast";

const ExploreClubs = () => {

  const [allClubs, setAllClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const [selectedClub, setSelectedClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const userId = user?._id || user?.id;

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {

      const res = await API.get("/club");
      setAllClubs(res.data);

    } catch (err) {

      toast.error("Could not load clubs.");

    } finally {

      setLoading(false);

    }
  };

  const handleViewDetails = async (club) => {

    setSelectedClub(club);
    setViewLoading(true);

    try {

      const res = await API.get(`/events?clubId=${club._id}`);
      setClubEvents(res.data);

    } catch (err) {

      setClubEvents([]);
      toast.error("Failed to load club events.");

    } finally {

      setViewLoading(false);

    }
  };

  const handleRegisterEvent = async (eventId) => {

    if (!userId) return toast.error("Please login to register.");

    try {

      const res = await API.post(`/events/${eventId}/register`, { userId });

      toast.success(res.data.message || "Registration request sent!");

      setClubEvents(prev =>
        prev.map(ev =>
          ev._id === eventId
            ? {
                ...ev,
                pendingParticipants: [
                  ...(ev.pendingParticipants || []),
                  userId
                ]
              }
            : ev
        )
      );

    } catch (err) {

      toast.error(err.response?.data?.message || "Registration failed.");

    }
  };

  const handleJoin = async (clubId) => {

    if (!userId) return toast.error("Please login.");

    try {

      const res = await API.post("/club/students/join-club", { userId, clubId })

      toast.success(res.data.message);

      const updatedUser = {
        ...user,
        joinedClubs: [...(user.joinedClubs || []), clubId]
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setAllClubs(prev =>
        prev.map(c =>
          c._id === clubId
            ? { ...c, membersCount: (c.membersCount || 0) + 1 }
            : c
        )
      );

    } catch (err) {

      toast.error(err.response?.data?.message || "Failed to join club");

    }
  };

  const filteredClubs = useMemo(() => {

    return allClubs.filter(club => {

      const matchesSearch = club.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" ||
        club.category === categoryFilter;

      return matchesSearch && matchesCategory;

    });

  }, [allClubs, searchTerm, categoryFilter]);

  if (loading)
    return (
      <div className="text-center p-5 mt-5">
        <div className="spinner-border text-info"></div>
      </div>
    );

  return (
    <div className="container-fluid p-4">

      {!selectedClub ? (

        <>
          <h2 className="fw-bold text-white mb-4">Explore Clubs</h2>

          <div className="row g-3 mb-4">

            <div className="col-md-6">
  <input
    type="text"
    className="form-control bg-dark text-white border-secondary custom-search-input"
    placeholder="search club.."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

            <div className="col-md-6 text-md-end">

              {["All", "Technical", "Cultural"].map(cat => (

                <button
                  key={cat}
                  className={`btn btn-sm me-2 ${
                    categoryFilter === cat
                      ? "btn-info text-dark"
                      : "btn-outline-info"
                  }`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>

              ))}

            </div>

          </div>

          <div className="row g-4">

            {filteredClubs.map(club => {

              const alreadyAMember = user?.joinedClubs?.some(
                id => id.toString() === club._id.toString()
              );

              return (

                <div className="col-lg-4 col-md-6" key={club._id}>

                  <div className="card bg-dark text-white p-4 shadow border-secondary">

                    <span className="badge bg-info mb-2">
                      {club.category}
                    </span>

                    <h4>{club.name}</h4>

                    <p className="text-secondary small">
                      {club.description?.substring(0, 100)}...
                    </p>

                    <p className="small text-info">
                      👥 {club.membersCount || 0} Members
                    </p>

                    <div className="row g-2">

                      <div className="col-6">

                        <button
                          className={`btn btn-sm w-100 ${
                            alreadyAMember
                              ? "btn-secondary disabled"
                              : "btn-info text-dark"
                          }`}
                          onClick={() =>
                            !alreadyAMember &&
                            handleJoin(club._id)
                          }
                        >
                          {alreadyAMember ? "Joined" : "Join"}
                        </button>

                      </div>

                      <div className="col-6">

                        <button
                          className="btn btn-sm btn-outline-light w-100"
                          onClick={() => handleViewDetails(club)}
                        >
                          Details
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </>

      ) : (

        <div className="text-white">

          <button
            className="btn btn-outline-info mb-4"
            onClick={() => setSelectedClub(null)}
          >
            ← Back
          </button>

          <h2 className="text-info">{selectedClub.name}</h2>

          <p>{selectedClub.description}</p>

          <p>
            👥 {selectedClub.membersCount || 0} Members
          </p>

          <h4 className="mt-4">Events</h4>

          {viewLoading ? (
            <p>Loading events...</p>
          ) : clubEvents.length === 0 ? (
            <p>No events available</p>
          ) : (
            clubEvents.map(event => {

              const isPending =
                event.pendingParticipants?.includes(userId);

              const isApproved =
                event.participants?.includes(userId);

              return (

                <div
                  key={event._id}
                  className="card bg-dark border-secondary p-3 mb-3"
                >

                  <h5>{event.title}</h5>

                  <p className="small text-secondary">
                    📅 {new Date(event.date).toDateString()}
                  </p>

                  {isApproved ? (
                    <button className="btn btn-success btn-sm disabled">
                      Approved
                    </button>
                  ) : isPending ? (
                    <button className="btn btn-warning btn-sm disabled">
                      Pending
                    </button>
                  ) : (
                    <button
                      className="btn btn-info btn-sm text-dark"
                      onClick={() =>
                        handleRegisterEvent(event._id)
                      }
                    >
                      Register
                    </button>
                  )}

                </div>

              );

            })
          )}

        </div>

      )}

    </div>
  );
};

export default ExploreClubs;