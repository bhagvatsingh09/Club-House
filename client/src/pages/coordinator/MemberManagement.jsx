import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const MemberManagement = () => {

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const clubId = user?.clubId;

  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {

    if (!clubId) return;

    try {

      const res = await API.get(`/club/${clubId}/members`);
      setMembers(res.data);

    } catch (err) {

      console.error("Failed to load members", err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchMembers();
  }, [clubId]);



  const handleRoleChange = async (userId, newRole) => {

    if (newRole === "Remove") {

      const confirm = window.confirm("Remove this member?");
      if (!confirm) return;

      try {

        await API.put(`/club/remove-member/${userId}`);
        fetchMembers();

      } catch (err) {

        alert("Error removing member");

      }

      return;

    }

    try {

      await API.put(`/club/update-role/${userId}`, { role: newRole });
      fetchMembers();

    } catch (err) {

      alert("Error updating role");

    }

  };


  const filteredMembers = members.filter(member => {

    const name = member.name?.toLowerCase() || "";
    const roll = member.roll?.toLowerCase() || "";

    return (
      name.includes(searchTerm.toLowerCase()) ||
      roll.includes(searchTerm.toLowerCase())
    );

  });


  // 📊 MEMBER STATISTICS
  const totalMembers = members.length;

  const totalVolunteers = members.filter(
    m => m.clubRole === "Volunteer"
  ).length;

  const totalRegularMembers = members.filter(
    m => m.clubRole !== "Volunteer"
  ).length;



  return (

    <div className="container-fluid p-0">

      {/* Page Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="text-white fw-bold">Manage Members</h2>

        <input
          type="text"
          placeholder="Search member..."
          className="form-control w-auto bg-dark text-white border-secondary"
          onChange={(e)=>setSearchTerm(e.target.value)}
        />

      </div>



      {/* 📊 Statistics Section */}

      <div className="row mb-4">

        <div className="col-md-4">

          <div className="card bg-dark text-white p-3 shadow">

            <h6>Total Members</h6>
            <h3 className="text-info">{totalMembers}</h3>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card bg-dark text-white p-3 shadow">

            <h6>Volunteers</h6>
            <h3 className="text-warning">{totalVolunteers}</h3>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card bg-dark text-white p-3 shadow">

            <h6>Regular Members</h6>
            <h3 className="text-success">{totalRegularMembers}</h3>

          </div>

        </div>

      </div>



      {/* Loading */}

      {loading ? (

        <div className="text-center py-5">
          <div className="spinner-border text-info"></div>
        </div>

      ) : (


        <div className="row g-4">


          {filteredMembers.map(member => (

            <div className="col-md-6 col-lg-4" key={member._id}>


              <div className="card bg-dark text-white p-4 rounded-4 shadow-lg">


                <h5>{member.name}</h5>

                <p className="text-info small">
                  {member.roll || member.email}
                </p>


                <div className="d-flex justify-content-between align-items-center">


                  {/* 🏅 Role Badge */}

                  {/* 🏅 Volunteer Badge */}
  {member.clubRole === "Volunteer" && (
    <span
      className="badge bg-warning text-dark position-absolute"
      style={{ top: "10px", right: "10px", fontSize: "16px" }}
    >
      🏅
    </span>
  )}



                  {/* Role Selector */}

                  <select
                    className="form-select form-select-sm bg-dark text-white border-secondary w-auto"
                    value={member.clubRole || "Member"}
                    onChange={(e)=>handleRoleChange(member._id, e.target.value)}
                  >

                    <option value="Member">Member</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Remove">Remove</option>

                  </select>


                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

};

export default MemberManagement;