import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await API.get("/users?role=Faculty"); // ✅ FIXED
        setFaculty(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFaculty();
  }, []);

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="mb-5">
        <h2 className="fw-bold text-info">Faculty Coordinators</h2>
        <p className="text-secondary">
          Manage and monitor all faculty assigned to clubs.
        </p>
      </div>

      {/* LIST */}
      {faculty.length === 0 ? (
        <div className="text-center text-secondary py-5">
          No faculty found
        </div>
      ) : (
        <div className="row g-4">

          {faculty.map((f) => (
            <div className="col-md-6 col-lg-4" key={f._id}>
              <div
                className="card p-4 border-0 rounded-4 shadow-lg h-100"
                style={{
                  backgroundColor: "#050a18",
                  border: "1px solid #1a203c"
                }}
              >

                {/* TOP */}
                <div className="d-flex align-items-center gap-3 mb-3">

                  <img
                    src={`https://ui-avatars.com/api/?name=${f.name}`}
                    className="rounded-circle border border-info"
                    style={{ width: "60px", height: "60px" }}
                    alt="avatar"
                  />

                  <div>
                    <h5 className="text-white fw-bold mb-0">
                      {f.name}
                    </h5>
                    <p className="text-info small mb-0">
                      {f.email}
                    </p>
                  </div>

                </div>

                <hr className="border-secondary" />

                {/* DETAILS */}
                <div className="small">

                  <p className="mb-2">
                    <span className="text-secondary">Department:</span>{" "}
                    <span className="text-light">
                      {f.department || "N/A"}
                    </span>
                  </p>

                  <p className="mb-2">
                    <span className="text-secondary">Designation:</span>{" "}
                    <span className="text-light">
                      {f.designation || "N/A"}
                    </span>
                  </p>

                  <p className="mb-2">
                    <span className="text-secondary">Phone:</span>{" "}
                    <span className="text-light">
                      {f.phone || "N/A"}
                    </span>
                  </p>

                  <p className="mb-0">
                    <span className="text-secondary">Joined:</span>{" "}
                    <span className="text-light">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </p>

                </div>

                {/* ACTIONS */}
                <div className="mt-4 d-flex gap-2">

                  <button className="btn btn-outline-info btn-sm rounded-pill w-100">
                    View Profile
                  </button>

                  <button className="btn btn-outline-danger btn-sm rounded-pill w-100">
                    Remove
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default FacultyList;