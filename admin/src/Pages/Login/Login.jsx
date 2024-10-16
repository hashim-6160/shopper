import React, { useState } from "react";
import './Login.css';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/loggin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Login Successful",
          text: "Redirecting to dashboard...",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          localStorage.setItem("auth-token", result.token); // Store token
          navigate("/dashboard"); // Redirect to dashboard
        });
      } else {
        Swal.fire({
          title: "Login Failed",
          text: result.error,
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `Error logging in: ${error.message}`,
        icon: "error",
        confirmButtonText: "Try Again",
      });
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
