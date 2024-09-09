import React from "react";
import "./Navbar.css";
import navlogo from "../../assets/Admin_Assets/nav-logo.svg";

const Navbar = () => {
  return (
    <div className="navbar">
      <img src={navlogo} alt="Logo" className="nav-logo" />
      <button
        onClick={() => {
          localStorage.removeItem("auth-token"); // Remove token on logout
          window.location.replace("/"); // Redirect to login page
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
