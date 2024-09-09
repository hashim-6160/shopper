import React, { useEffect, useState } from "react";
import "./ListUser.css";
import block_icon from "../../assets/Admin_Assets/block-icon.png";
import unblock_icon from "../../assets/Admin_Assets/unblock_icon.png";

const ListUser = () => {
  const [allusers, setAllUsers] = useState([]);

  const fetchInfo = async () => {
    await fetch("http://localhost:4000/listusers")
      .then((resp) => resp.json())
      .then((data) => {
        setAllUsers(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const block_user = async (id) => {
    try {
      const response = await fetch("http://localhost:4000/blockuser", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        alert("User Blocked successfully");
        await fetchInfo(); // Refresh user list after blocking
      } else {
        console.error("Failed to block user");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const unblock_user = async (id) => {
    try {
      const response = await fetch("http://localhost:4000/unblockuser", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        alert("User Unblocked successfully");
        await fetchInfo(); // Refresh user list after unblocking
      } else {
        console.error("Failed to unblock user");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="list-users">
      <h1>All Users List</h1>
      <div className="listusers-format-main">
        <p>Name</p>
        <p>Email</p>
        <p>Phone</p>
        <p>Status</p>
        <p>Actions</p>
      </div>
      <div className="listusers-allusers">
        <hr />
        {allusers.map((user, index) => {
          return (
            <>
            <div key={index} className="listusers-format-main listusers-format">
              <p>{user.name}</p>
              <p>{user.email}</p>
              <p>{user.phone}</p>
              <p className={`status ${user.isBlocked ? 'inactive' : 'active'}`}>
                {user.isBlocked ? 'Inactive' : 'Active'}
              </p>
              <div className="actions">
                {user.isBlocked ? (
                  <img
                    onClick={() => unblock_user(user._id)}
                    className="listusers-block-icon"
                    src={block_icon}
                    alt="Unblock"
                  />
                ) : (
                  <img
                    onClick={() => block_user(user._id)}
                    className="listusers-block-icon"
                    src={unblock_icon}
                    alt="Block"
                  />
                )}
              </div> 
            </div>
            <hr />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default ListUser;
