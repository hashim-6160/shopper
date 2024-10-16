import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate"; // Import react-paginate
import Swal from "sweetalert2"; // Import sweetalert2
import "./ListUser.css";
import block_icon from "../../assets/Admin_Assets/block-icon.png";
import unblock_icon from "../../assets/Admin_Assets/unblock_icon.png";

const ListUser = () => {
  const [allusers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Current page state
  const usersPerPage = 5; // Number of users to display per page

  // Fetch user data
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

  // Block user
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
        Swal.fire({
          title: "User Blocked!",
          text: "The user has been successfully blocked.",
          icon: "success",
        });
        await fetchInfo();
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to block the user.",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Something went wrong: ${error.message}`,
        icon: "error",
      });
    }
  };

  // Unblock user
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
        Swal.fire({
          title: "User Unblocked!",
          text: "The user has been successfully unblocked.",
          icon: "success",
        });
        await fetchInfo();
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to unblock the user.",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Something went wrong: ${error.message}`,
        icon: "error",
      });
    }
  };

  // Pagination logic: Determine users to display on the current page
  const offset = currentPage * usersPerPage;
  const currentUsers = allusers.slice(offset, offset + usersPerPage);
  const pageCount = Math.ceil(allusers.length / usersPerPage); // Calculate total pages

  // Handle page click
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
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
        {currentUsers.map((user, index) => {
          return (
            <React.Fragment key={index}>
              <div className="listusers-format-main listusers-format">
                <p>{user.name}</p>
                <p>{user.email}</p>
                <p>{user.phone}</p>
                <p className={`status ${user.isBlocked ? "inactive" : "active"}`}>
                  {user.isBlocked ? "Inactive" : "Active"}
                </p>
                <div className="actions">
                  {user.isBlocked ? (
                    <img
                      onClick={() => unblock_user(user._id)}
                      className="listusers-block-icon"
                      src={unblock_icon}
                      alt="Unblock"
                    />
                  ) : (
                    <img
                      onClick={() => block_user(user._id)}
                      className="listusers-block-icon"
                      src={block_icon}
                      alt="Block"
                    />
                  )}
                </div>
              </div>
              <hr />
            </React.Fragment>
          );
        })}
      </div>

      {/* Pagination controls */}
      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        pageClassName={"pagination-button"}
        previousClassName={"pagination-button previous"}
        nextClassName={"pagination-button next"}
        activeClassName={"active"}
        disabledClassName={"disabled"}
      />
    </div>
  );
};

export default ListUser;
