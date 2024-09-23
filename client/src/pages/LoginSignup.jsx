import React, { useState, useEffect } from "react";
import "./css/LoginSignup.css";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api";
import { useNavigate } from "react-router-dom";

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
    } else if (responseData.error) {
      alert(responseData.error);
    } else {
      alert("An unknown error occurred.");
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
      window.location.replace("/");
    } else if (responseData.error) {
      alert(responseData.error);
    } else {
      alert("An unknown error occurred.");
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
          window.location.replace("/");
        } else {
          alert(data.error);
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
          alert(data.message);
        } else {
          alert(data.error);
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
        window.location.replace("/");
      }
    } catch (error) {
      console.log("error while requesting google code :", error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => console.error("Login failed", error),
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
              <button onClick={() => login()}>Continue</button>
            </div>
            <h2>OR</h2>
            <div className="googlelogin">
              <button onClick={googleLogin}>Login with Google</button>
            </div>
          </div>
        )}
        {state === "Sign Up" ? (
          <p className="loginsignup-login">
            Already have an account?{" "}
            <span onClick={() => setState("Login")}>Login here</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Create an account?{" "}
            <span onClick={() => setState("Sign Up")}>Click here</span>
          </p>
        )}
        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By Continuing, I agree to the terms of use & privacy policy</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
