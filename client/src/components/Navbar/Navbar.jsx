import "./Navbar.css";
import logo from "../Assets/Frontend_Assets/logo.png";
import cart_icon from "../Assets/Frontend_Assets/cart_icon.png";
import user_icon from "../Assets/Frontend_Assets/user_icon.jpeg";
import wish_icon from '../Assets/Frontend_Assets/wishlist_icon.webp';
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import nav_dropdown from "../Assets/Frontend_Assets/nav_dropdown.png";
import { useDispatch, useSelector } from "react-redux";
import { getCartAsync, selectTotalItems } from "../../redux/cart";

const Navbar = () => {
  const dispatch = useDispatch();
  const totalItems = useSelector(selectTotalItems); // Get total items from Redux store

  useEffect(() => {
    dispatch(getCartAsync()); // Fetch cart data when the component mounts
  }, [dispatch]);

  const [menu, setMenu] = useState("Shop");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("auth-token")
  );
  const menuRef = useRef();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle("nav-menu-visible");
    e.target.classList.toggle("open");
  };

  // Update login state when auth-token changes
  useEffect(() => {
    const authToken = localStorage.getItem("user-info");
    setIsLoggedIn(!!authToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user-info");
    setIsLoggedIn(false);
    window.location.replace("/");
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="Logo" />
        <p>WEIRDO</p>
      </div>
      <img
        className="nav-dropdown"
        onClick={dropdown_toggle}
        src={nav_dropdown}
        alt=""
      />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("Shop")}>
          <Link style={{ textDecoration: "none" }} to="/">
            Shop
          </Link>
          {menu === "Shop" && <hr />}
        </li>
        <li onClick={() => setMenu("Men")}>
          <Link style={{ textDecoration: "none" }} to="/mens">
            Men
          </Link>
          {menu === "Men" && <hr />}
        </li>
        <li onClick={() => setMenu("Women")}>
          <Link style={{ textDecoration: "none" }} to="/womens">
            Women
          </Link>
          {menu === "Women" && <hr />}
        </li>
        <li onClick={() => setMenu("Kids")}>
          <Link style={{ textDecoration: "none" }} to="/kids">
            Kids
          </Link>
          {menu === "Kids" && <hr />}
        </li>
      </ul>
      <div className="nav-login-cart">
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
        <Link to="/cart">
          <img src={cart_icon} alt="cart" />
        </Link>
        {isLoggedIn &&(
          <div className="nav-cart-count">{totalItems}</div>
        )} 
        <div className="wishlist-icon">
        <Link to="/cart">
          <img  src={wish_icon} alt="cart" />
        </Link>
        </div>
        
      </div>
      {/* Conditionally render profile icon only if logged in */}
      {isLoggedIn && (
        <div className="profile-icon">
          <Link to="/userprofile">
            <img src={user_icon} alt="profile" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
