import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const StudentApprovals = () => {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchApprovedStudents();
  }, []);

 const fetchApprovedStudents = async () => {

  try {

    let res;

    if (window.location.pathname.startsWith("/admin")) {

      // Admin page
      res = await API.get("/admin/approved-students");

    } else {

      // Coordinator page
      res = await API.get(`/club/${user?.clubId}/approved-students`);

    }

    setStudents(res.data);

  } catch (err) {

    console.error("Fetch error:", err);

  } finally {

    setLoading(false);

  }

};

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-info"></div>
      </div>
    );
  }

  return (

    <div className="container p-4">

      <h2 className="text-white mb-4">
        Approved Students
      </h2>

      {students.length === 0 ? (
        <p className="text-light">No approved students</p>
      ) : (

        <table className="table table-dark table-striped">

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Club</th>
              <th>Event</th>
            </tr>
          </thead>

          <tbody>

            {students.map((s, index) => (

              <tr key={index}>

                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.studentId}</td>
                <td>{s.clubName}</td>
                <td>{s.eventName}</td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

};

export default StudentApprovals;