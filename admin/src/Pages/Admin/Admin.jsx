import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import AddProduct from "../../Components/AddProduct/AddProduct";
import ListProduct from "../../Components/ListProduct/ListProduct";
import ListUser from "../../Components/ListUser/ListUser";
import AddCategory from "../../Components/AddCategory/AddCategory";
import OrderManagement from "../../Components/OrderManagement/OrderManagement";
import OrderDetails from "../../Components/OrderView/OrderDetails";
import "./Admin.css";

const Admin = () => {
  return (
    <div className="admin">
      <Sidebar />
      <Routes>
        <Route path="addproduct" element={<AddProduct />} />
        <Route path="listproduct" element={<ListProduct />} />
        <Route path="listusers" element={<ListUser />} />
        <Route path="addcategory" element={<AddCategory />} />
        <Route path="ordermanagement" element={<OrderManagement />} />
        <Route path="ordermanagement/order/:id" element={<OrderDetails />} />
      </Routes>
    </div>
  );
};

export default Admin;
