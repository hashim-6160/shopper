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

  const handleSubmit = async (url, successCallback) => {
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
          title: "Google Login Success",
          text: "You are now logged in!",
        });
        window.location.replace("/");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: "An error occurred during Google login.",
      });
      console.log("error while requesting google code :", error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: "Login failed. Please try again.",
      });
      console.error("Login failed", error);
    },
    flow: "auth-code",
  });

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        {state === "Sign Up" || state === "Verify OTP" ? (
          <>
            <div className="loginsignup-fields">
              {state === "Sign Up" && (
                <>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={changeHandler}
                    type="text"
                    placeholder="Your Name"
                  />
                  {errors.username && (
                    <p className="error-message">{errors.username}</p>
                  )}
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={changeHandler}
                    type="number"
                    placeholder="Your Number"
                  />
                  {errors.phone && (
                    <p className="error-message">{errors.phone}</p>
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
                    name="password"
                    value={formData.password}
                    onChange={changeHandler}
                    type="password"
                    placeholder="Password"
                  />
                  {errors.password && (
                    <p className="error-message">{errors.password}</p>
                  )}
                </>
              )}
              {state === "Verify OTP" && (
                <>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    type="text"
                    placeholder="Enter OTP"
                  />
                  <p>
                    Time remaining: {Math.floor(timer / 60)}:
                    {("0" + (timer % 60)).slice(-2)}
                  </p>
                  {isResendVisible && (
                    <button onClick={resendOtp}>Resend OTP</button>
                  )}
                </>
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
