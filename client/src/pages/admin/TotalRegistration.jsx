import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const TotalRegistration = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
  try {
    console.log("Calling API...");
    const res = await API.get("/admin/registrations");
    console.log("API RESPONSE:", res.data); // 👈 MUST log
    setData(res.data);
  } catch (err) {
    console.error("Error fetching registrations", err.response || err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-info"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h2 className="text-white fw-bold mb-4">Total Registrations</h2>

      <div className="card p-0 border-0 shadow-lg"
        style={{ backgroundColor: "#050a18", border: "1px solid #1a203c" }}
      >
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0">
            <thead>
              <tr className="text-secondary small text-uppercase">
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
                <th>Event</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {data.map((reg, index) => (
                <tr key={reg._id}>
                  <td>{index + 1}</td>

                  <td>{reg.user?.name || "N/A"}</td>
                  <td>{reg.user?.email || "N/A"}</td>

                  <td>{reg.event?.title || "N/A"}</td>

                  <td>
                    {reg.event?.date
                      ? new Date(reg.event.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-secondary py-5">
                    No registrations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TotalRegistration;