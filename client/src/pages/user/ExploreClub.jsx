import React, { useState, useEffect, useMemo } from "react";
import API from "../../api/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ExploreClubs = () => {
  const [allClubs, setAllClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
    const serverUrl = 'http://localhost:5000';


  const [selectedClub, setSelectedClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  const [groupInputs, setGroupInputs] = useState({});
  const navigate = useNavigate();

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
      // console.log(res.data)
    } catch {
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
    } catch {
      setClubEvents([]);
      toast.error("Failed to load events");
    } finally {
      setViewLoading(false);
    }
  };

  const handleJoin = async (clubId) => {
    if (!userId) return toast.error("Login required");

    try {
      const res = await API.post("/club/students/join-club", {
        userId,
        clubId,
      });

      toast.success(res.data.message);

      const updatedUser = {
        ...user,
        joinedClubs: [...(user.joinedClubs || []), clubId],
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setAllClubs((prev) =>
        prev.map((c) =>
          c._id === clubId
            ? { ...c, membersCount: (c.membersCount || 0) + 1 }
            : c
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Join failed");
    }
  };

  const filteredClubs = useMemo(() => {
    return allClubs.filter(
      (club) =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === "All" || club.category === categoryFilter)
    );
  }, [allClubs, searchTerm, categoryFilter]);

  if (loading)
    return <div className="text-center mt-5 text-info">Loading...</div>;

  return (
    <div className="container-fluid p-4">
      {!selectedClub ? (
        <>
          <h2 className="text-white mb-4">Explore Clubs</h2>

          <input
            type="text"
            className="form-control mb-4 bg-dark text-white"
            placeholder="Search club..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="row">
  {filteredClubs.map((club) => {
    const joined = user?.joinedClubs?.includes(club._id);

    return (
      <div key={club._id} className="col-md-4 mb-4">

        <div className="club-card p-3">

          {/* IMAGE (SAFE FALLBACK) */}
          <img
            src={
              `${serverUrl}${club.banner}` ||
              "https://via.placeholder.com/300x200"
            }
            alt={club.name}
            className="club-img mb-3"
          />

          {/* TEXT */}
          <h5 className="text-info">{club.name}</h5>

          <p className="text-secondary">
            {club.description}
          </p>

          {/* BUTTONS (ALWAYS VISIBLE) */}
          <div className="mt-3">
            <button
              className="btn btn-info btn-sm me-2"
              disabled={joined}
              onClick={() => handleJoin(club._id)}
            >
              {joined ? "Joined" : "Join"}
            </button>

            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => handleViewDetails(club)}
            >
              Details
            </button>
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
            className="btn btn-outline-info mb-3"
            onClick={() => setSelectedClub(null)}
          >
            Back
          </button>

          <h2>{selectedClub.name}</h2>
          <p>{selectedClub.description}</p>

          <h4 className="mt-4">Events</h4>

          {viewLoading ? (
            <p>Loading...</p>
          ) : clubEvents.length === 0 ? (
            <p>No events</p>
          ) : (
            clubEvents.map((event) => {
              const isPending = event.pendingParticipants?.some(
                (id) => id.toString() === userId
              );

              const isApproved = event.participants?.some(
                (id) => id.toString() === userId
              );

              return (
                <div
                  key={event._id}
                  className="card bg-dark p-3 mb-3 text-light rounded-4"
                >
                  <h5 className="text-info">{event.title}</h5>

                  <p className="text-secondary">
                    📅 {new Date(event.date).toDateString()}
                  </p>
                  <p className="text-secondary">
                    ⏰ {event.time || "Not specified"}
                  </p>
                  <p className="text-secondary">
                    📍 {event.location || "Not specified"}
                  </p>
                  <p className="text-warning">
                    👥 {event.participationType}
                  </p>

                  <p className="text-light">{event.description}</p>

                  {event.participationType === "group" && (
                    <input
                      className="form-control mt-2 bg-dark text-white"
                      placeholder="Enter emails"
                      value={groupInputs[event._id] || ""}
                      onChange={(e) =>
                        setGroupInputs({
                          ...groupInputs,
                          [event._id]: e.target.value,
                        })
                      }
                    />
                  )}

                  <div className="mt-2">
                    {isApproved ? (
                      <button className="btn btn-success btn-sm" disabled>
                        Approved
                      </button>
                    ) : isPending ? (
                      <button className="btn btn-warning btn-sm" disabled>
                        Pending
                      </button>
                    ) : (
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() =>
                          navigate(`/user/event-register/${event._id}`, {
                            state: { event },
                          })
                        }
                      >
                        Register
                      </button>
                    )}
                  </div>
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