import React from "react";
import { Link } from "react-router-dom";
import add_product_icon from "../../assets/Admin_Assets/Product_Cart.svg";
import list_product_icon from "../../assets/Admin_Assets/Product_list_icon.svg";
import user_icon from "../../assets/Admin_Assets/user_logo.png";
import add_category_icon from '../../assets/Admin_Assets/AddCategory_icon.webp'
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to="addproduct" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="Add Product" />
          <p>Add Product</p>
        </div>
      </Link>

      <Link to="listproduct" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="List Product" />
          <p>Product List</p>
        </div>
      </Link>

      <Link to="listusers" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img className="user-icon" src={user_icon} alt="Users List" />
          <p>Users List</p>
        </div>
      </Link>

      <Link to="addcategory" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img className="add_category-icon" src={add_category_icon} alt="Add Category" />
          <p>Add Category</p>
        </div>
      </Link>

      <Link to="ordermanagement" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img className="add_category-icon" src={add_category_icon} alt="Add Category" />
          <p>Order Management</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
