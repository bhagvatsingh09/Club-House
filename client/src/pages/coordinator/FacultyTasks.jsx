import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const FacultyTasks = () => {
  const [tasks, setTasks] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const clubId = user?.clubId;

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/admin/faculty/tasks/${clubId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (clubId) fetchTasks();
  }, [clubId]);

  const handleResponse = async (taskId, status) => {
  let reason = "";

  if (status === "Rejected") {
    reason = prompt("Enter reason:");
    if (!reason) return;
  }

  // ✅ instantly disable buttons
  setLoadingTaskId(taskId);

  try {
    await API.put("/admin/faculty/task-response", {
      taskId,
      clubId,
      status,
      reason
    });

    alert(status === "Accepted" ? "Accepted ✔" : "Rejected ❌");
    fetchTasks();
  } catch (err) {
    alert("Something went wrong");
  } finally {
    setLoadingTaskId(null);
  }
};

  return (
    <div className="container-fluid p-4">
      <h2 className="text-info fw-bold mb-4">My Club Tasks</h2>

      {tasks.length === 0 ? (
        <p className="text-secondary">No tasks assigned</p>
      ) : (
        <div className="row g-4">
          {tasks.map(task => {
            const myResponse = task.responses.find(
              r => String(r.club) === String(clubId)
            );

            return (
              <div className="col-md-6 col-lg-4" key={task._id}>
                <div className="card p-4 bg-dark text-white border">

                  {/* <h5 className="text-info">
                    {task.clubs.map(c => c.name).join(", ")}
                  </h5> */}

                  <p>{task.directive}</p>

                  <p className="small text-secondary">
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </p>

                  <span className={`badge ${
                    myResponse?.status === "Pending" ? "bg-warning" :
                    myResponse?.status === "Accepted" ? "bg-success" :
                    "bg-danger"
                  }`}>
                    {myResponse?.status || "Pending"}
                  </span>

                  {myResponse?.reason && (
                    <p className="text-danger small mt-2">
                      Reason: {myResponse.reason}
                    </p>
                  )}

                 <div className="mt-3">
  {!myResponse || myResponse.status === "Pending" ? (
    <>
      <button
        className="btn btn-success me-2"
        disabled={loadingTaskId === task._id}
        onClick={() => handleResponse(task._id, "Accepted")}
      >
        {loadingTaskId === task._id ? "Processing..." : "Accept"}
      </button>

      <button
        className="btn btn-danger"
        disabled={loadingTaskId === task._id}
        onClick={() => handleResponse(task._id, "Rejected")}
      >
        {loadingTaskId === task._id ? "Processing..." : "Deny"}
      </button>
    </>
  ) : null}
</div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FacultyTasks;