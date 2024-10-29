
import React, { useState, useEffect } from "react";
import "./css/LoginSignup.css";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert

const LoginSignup = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(200); // 3 minutes
  const [isResendVisible, setIsResendVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) return prevTimer - 1;
        setIsResendVisible(true); // Show the resend button when timer reaches 0
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateSignup = () => {
    const newErrors = {};
    
    // Trim whitespace from input values
    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedPassword = formData.password.trim();

    // Validate username
    if (!trimmedUsername) {
      newErrors.username = "Username is required";
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(trimmedEmail)) {
      newErrors.email = "Invalid email format";
    }

    // Validate phone number
    const phonePattern = /^\d{10}$/; // 10 digits for phone number
    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!phonePattern.test(trimmedPhone)) {
      newErrors.phone = "Invalid phone number format. Must be 10 digits.";
    }

    // Validate password
    if (!trimmedPassword) {
      newErrors.password = "Password is required";
    } else if (trimmedPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (url, successCallback) => {
    if (!validateSignup()) return; // Validate before proceeding

    let responseData;
    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => (responseData = data));

    if (responseData.success) {
      localStorage.setItem("user-info", responseData.token);
      successCallback();

      // Show SweetAlert for successful signup or login
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Signup successful! Please verify OTP.",
      });
    } else if (responseData.error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: responseData.error,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unknown error occurred.",
      });
    }
  };

  const login = async () => {
    let responseData;
    await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    })
      .then((resp) => resp.json())
      .then((data) => (responseData = data));

    if (responseData.success) {
      localStorage.setItem("user-info", responseData.token);
      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: "Login successful!",
      });
      window.location.replace("/");
    } else if (responseData.error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: responseData.error,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unknown error occurred.",
      });
    }
  };

  const signup = () =>
    handleSubmit("http://localhost:4000/signup", () => {
      setState("Verify OTP");
    });

  const verifyOtp = () => {
    fetch("http://localhost:4000/verify-otp", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formData.email, otp }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("user-info", data.token);
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "OTP Verified successfully!",
          });
          window.location.replace("/");
        } else {
          Swal.fire({
            icon: "error",
            title: "Invalid OTP",
            text: data.error,
          });
        }
      });
  };

  const resendOtp = () => {
    fetch("http://localhost:4000/resend-otp", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formData.email }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.success) {
          setTimer(200); // Reset the timer
          setIsResendVisible(false); // Hide the resend button
          Swal.fire({
            icon: "success",
            title: "OTP Sent",
            text: "OTP has been resent. Please check your email.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error,
          });
        }
      });
  };

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult["code"]);
        const { email, name, token } = result.data.user;
        const obj = { email, name, token };
        localStorage.setItem("user-info", JSON.stringify(obj));
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Login successful!",
        });
        window.location.replace("/");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to login with Google.",
      });
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (code) => responseGoogle(code),
    onError: (error) => {
      console.error("Login Failed:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Failed to login with Google.",
      });
    },
  });

  return (
    <div className="loginsignup-container">
      <div className="loginsignup-form">
        <h1>{state}</h1>
        {state === "Sign Up" ? (
          <>
            <div>
              <input
                name="username"
                value={formData.username}
                onChange={changeHandler}
                type="text"
                placeholder="Username"
              />
              {errors.username && (
                <p className="error-message">{errors.username}</p>
              )}
              <input
                name="email"
                value={formData.email}
                onChange={changeHandler}
                type="email"
                placeholder="Email Address"
              />
              {errors.email && (
                <p className="error-message">{errors.email}</p>
              )}
              <input
                name="phone"
                value={formData.phone}
                onChange={changeHandler}
                type="text"
                placeholder="Phone Number"
              />
              {errors.phone && (
                <p className="error-message">{errors.phone}</p>
              )}
              <input
                name="password"
                value={formData.password}
                onChange={changeHandler}
                type="password"
                placeholder="Password"
              />
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>
            <button
              onClick={() => {
                state === "Sign Up" ? signup() : verifyOtp();
              }}
            >
              {state === "Sign Up" ? "Continue" : "Verify OTP"}
            </button>
          </>
        ) : (
          <div>
            <div className="loginsignup-login-fields">
              <input
                name="email"
                value={formData.email}
                onChange={changeHandler}
                type="email"
                placeholder="Email Address"
              />
              <input
                name="password"
                value={formData.password}
                onChange={changeHandler}
                type="password"
                placeholder="Password"
              />
            </div>
            <button onClick={login}>Login</button>
            <button onClick={() => setState("Sign Up")}>
              New User? Sign up here.
            </button>
            <button onClick={googleLogin}>Login with Google</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
