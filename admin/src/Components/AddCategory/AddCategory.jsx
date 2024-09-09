import React, { useState, useEffect } from "react";
import "./AddCategory.css";

const AddCategory = () => {
  const [category, setCategory] = useState({ name: "", description: "" });
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await fetch("http://localhost:4000/categories");
    const data = await response.json();
    setCategories(data);
  };

  const changeHandler = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const addCategoryHandler = async () => {
    const response = await fetch("http://localhost:4000/addcategory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });
    const data = await response.json();
    if (data.success) {
      alert("Category Added");
      fetchCategories();
      setCategory({ name: "", description: "" });
    } else {
      alert("Failed to add category");
    }
  };

  const editCategoryHandler = (cat) => {
    setIsEditing(true);
    setEditCategoryId(cat._id);
    setCategory({ name: cat.name, description: cat.description });
  };

  const updateCategoryHandler = async () => {
    const response = await fetch(`http://localhost:4000/updatecategory/${editCategoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });
    const data = await response.json();
    if (data.success) {
      alert("Category Updated");
      fetchCategories();
      setCategory({ name: "", description: "" });
      setIsEditing(false);
    } else {
      alert("Failed to update category");
    }
  };

  const toggleCategoryStatus = async (id, isActive) => {
    const response = await fetch(`http://localhost:4000/togglecategory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive: !isActive }), // Toggle status
    });
    const data = await response.json();
    if (data.success) {
      alert(isActive ? "Category Removed" : "Category Added");
      fetchCategories(); // Refresh the list
    } else {
      alert("Failed to update category status");
    }
  };

  return (
    <div className="add-category">
      <h2>Add or Edit Category</h2>
      <div className="add-category-itemfield">
        <p>Category Name</p>
        <input
          type="text"
          name="name"
          value={category.name}
          onChange={changeHandler}
          placeholder="Enter category name"
        />
      </div>
      <div className="add-category-itemfield">
        <p>Description</p>
        <textarea
          name="description"
          value={category.description}
          onChange={changeHandler}
          placeholder="Enter category description"
        />
      </div>
      <button
        className="add-category-btn"
        onClick={isEditing ? updateCategoryHandler : addCategoryHandler}
      >
        {isEditing ? "Update Category" : "Add Category"}
      </button>

      <div className="category-list">
        <h3>Categories</h3>
        <div className="category-list-header">
          <div className="header-item">Name</div>
          <div className="header-item">Description</div>
          <div className="header-item">Status</div>
          <div className="header-item">Actions</div>
        </div>
        <ul>
          {categories.map((cat) => (
            <li key={cat._id} className="category-list-item">
              <div className="category-item">{cat.name}</div>
              <div className="category-item">{cat.description}</div>
              <p className="category-item category-status">
                {cat.isActive ? "Active" : "Inactive"}
              </p>
              <div className="category-actions">
                <button
                  className={cat.isActive ? "remove-button" : "add-button"}
                  onClick={() => toggleCategoryStatus(cat._id, cat.isActive)}
                >
                  {cat.isActive ? "Remove" : "Add"}
                </button>
                <button className="edit-button" onClick={() => editCategoryHandler(cat)}>Edit</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddCategory;
