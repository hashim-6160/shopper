import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserOverview.css"; 
import Swal from "sweetalert2"; 
import withReactContent from "sweetalert2-react-content"; 

const MySwal = withReactContent(Swal); 

const UserOverview = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [isEditing, setIsEditing] = useState(false); 
  const [error, setError] = useState(""); 

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("http://localhost:4000/profile", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setUserInfo({
          name: data.name,
          email: data.email,
          phoneNumber: data.phone,
          password: "", 
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const validateForm = () => {
    const { name, email, phoneNumber, password } = userInfo;
    let newError = "";

    // Validate name
    if (!name.trim()) {
      newError = "Name is required.";
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newError = "Email is required.";
    } else if (!emailPattern.test(email)) {
      newError = "Invalid email format.";
    }

    // Validate mobile number
    const phonePattern = /^[0-9]{10}$/; // 10 digits
    if (!phoneNumber.trim()) {
      newError = "Mobile Number is required.";
    } else if (!phonePattern.test(phoneNumber)) {
      newError = "Invalid mobile number format. Must be 10 digits.";
    }

    // Validate password
    if (password && password.length < 6) {
      newError = "Password must be at least 6 characters long.";
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newError = "Passwords do not match!";
    }

    setError(newError);
    return !newError; // Return true if no errors
  };

  const handleSave = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error,
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/updateprofile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
        },
        body: JSON.stringify(userInfo),
      });
      const data = await response.json();
      if (response.ok) {
        MySwal.fire({
          icon: "success",
          title: "Profile Updated!",
          text: "Your profile has been updated successfully.",
          confirmButtonText: "OK",
        });
        setIsEditing(false);
        setError(""); 
      } else {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Error updating profile: " + data.message,
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating user profile.",
        confirmButtonText: "OK",
      });
      console.error("Error updating user profile:", error);
    }
  };

  return (
    <div className="user-overview-container">
      <h2 className="user-overview-title">My Details</h2>

      <div className="user-overview-form-group">
        <label className="user-overview-label">Name</label>
        <input
          type="text"
          name="name"
          value={userInfo.name}
          onChange={handleChange}
          className="user-overview-input"
          readOnly={!isEditing} 
        />
      </div>

      <div className="user-overview-form-group">
        <label className="user-overview-label">E-mail</label>
        <input
          type="email"
          name="email"
          value={userInfo.email}
          onChange={handleChange}
          className="user-overview-input"
          readOnly={!isEditing} 
        />
      </div>

      <div className="user-overview-form-group">
        <label className="user-overview-label">Mobile Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={userInfo.phoneNumber}
          onChange={handleChange}
          className="user-overview-input"
          readOnly={!isEditing} 
        />
      </div>

      <div className="user-overview-form-group">
        <label className="user-overview-label">Change Password</label>
        <input
          type="password"
          name="password"
          value={userInfo.password}
          onChange={handleChange}
          className="user-overview-input"
          readOnly={!isEditing} 
        />
      </div>

      <div className="user-overview-form-group">
        <label className="user-overview-label">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          className="user-overview-input"
          readOnly={!isEditing} 
        />
      </div>
      
      {error && <p className="error-message">{error}</p>}

      <div className="user-overview-button-group">
        {isEditing ? (
          <button onClick={handleSave} className="user-overview-button">
            Save Changes
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="user-overview-button"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default UserOverview;
