import React, { useState, useEffect } from "react";
import { get, dele } from '../services/endPoints'
import "../styles/AdminPage.css";

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await get("/api/v1/users/get-all-users", {
          withCredentials: true,
        });
        setUsers(response.data.users);
      } catch (error) {
        setError("Error fetching users.");
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      const response = await dele(`/api/v1/users/delete-user/${userId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } else {
        setError("Error deleting user.");
      }
    } catch (error) {
      setError("Error deleting user.");
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="allUsersContainer">
      <h2 className="pageTitle">All Users</h2>
      {error && <p className="errorMessage">{error}</p>}
      <div className="usersList">
        {users.map((user) => (
          <div key={user._id} className="userCard">
            <img
              src={`http://localhost:8000/images/${user.profile}`}
              alt={user.userName}
              className="userImage"
            />
            <div className="userInfo">
              <p><strong>Username:</strong> {user.userName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
            <button
              onClick={() => handleDeleteUser(user._id)}
              className="deleteButton"
            >
              Delete User
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllUsers;
