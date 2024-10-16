import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import userprofile_icon from '../Assets/Frontend_Assets/userprofile_icon.jpg'
import './Profilesidebar.css'; // Import the CSS file

const Profilesidebar = () => {
  const [userInfo, setUserInfo] = useState({
    name: ""
  });

   // Fetch user details on component mount
   useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('http://localhost:4000/profile',  {
          method: "GET",
          headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setUserInfo({
          name: data.name
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);
  return (
    <div className="sidebar-container">
      <div className="user-info">
        <img 
          src={userprofile_icon}
          alt="User Avatar" 
          className="user-avatar"
        />
        <h2 className="username">Hello, {userInfo.name}</h2>
      </div>

      <nav>
        <ul className="nav-list">
          <li>
            <Link 
              to="/userprofile/overview" 
              className="nav-link"
            >
              Account Overview
            </Link>
          </li>
          <li>
            <Link 
              to="/userprofile/orders" 
              className="nav-link"
            >
              My Orders
            </Link>
          </li>
          <li>
            <Link 
              to="/userprofile/address" 
              className="nav-link"
            >
              Manage Addresses
            </Link>
          </li>
          <li>
            <Link 
              to="/userprofile/wishlist" 
              className="nav-link"
            >
              My Wishlist
            </Link>
          </li>
          <li>
            <Link 
              to="/userprofile/wallet" 
              className="nav-link"
            >
              Wallet
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Profilesidebar;
