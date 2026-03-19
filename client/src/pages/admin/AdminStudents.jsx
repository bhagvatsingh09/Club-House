import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/admin/students");
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="container mt-4">
      <h3>All Students</h3>

      <table className="table table-dark table-striped mt-3">
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
          {students.map((student) => (
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
    </div>
  );
};

export default AdminStudents;