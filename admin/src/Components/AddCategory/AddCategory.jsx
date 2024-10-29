import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./AddCategory.css";

const AddCategory = () => {
  const [category, setCategory] = useState({ name: "", description: "" });
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [error, setError] = useState(""); // State for error messages

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

  const validateForm = () => {
    const { name, description } = category;
    let newError = "";

    // Validate category name
    if (!name.trim()) {
      newError = "Category name is required.";
    } else if (name.length < 3) {
      newError = "Category name must be at least 3 characters long.";
    } else if (name.length > 30) {
      newError = "Category name must not exceed 30 characters.";
    }

    // Validate description
    if (!description.trim()) {
      newError = "Description is required.";
    } else if (description.length < 10) {
      newError = "Description must be at least 10 characters long.";
    }

    setError(newError);
    return !newError; // Return true if no errors
  };

  const addCategoryHandler = async () => {
    if (!validateForm()) {
      Swal.fire("Error", error, "error");
      return;
    }

    const response = await fetch("http://localhost:4000/addcategory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });
    const data = await response.json();
    if (data.success) {
      Swal.fire("Success", "Category Added", "success");
      fetchCategories();
      setCategory({ name: "", description: "" });
      setError(""); // Clear error message
    } else {
      Swal.fire("Error", "Failed to add category", "error");
    }
  };

  const editCategoryHandler = (cat) => {
    setIsEditing(true);
    setEditCategoryId(cat._id);
    setCategory({ name: cat.name, description: cat.description });
    setError(""); // Clear error message when editing
  };

  const updateCategoryHandler = async () => {
    if (!validateForm()) {
      Swal.fire("Error", error, "error");
      return;
    }

    const response = await fetch(`http://localhost:4000/updatecategory/${editCategoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });
    const data = await response.json();
    if (data.success) {
      Swal.fire("Success", "Category Updated", "success");
      fetchCategories();
      setCategory({ name: "", description: "" });
      setIsEditing(false);
      setError(""); // Clear error message
    } else {
      Swal.fire("Error", "Failed to update category", "error");
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
      Swal.fire(
        isActive ? "Category Removed" : "Category Added",
        `Category has been ${isActive ? "removed" : "added"} successfully!`,
        "success"
      );
      fetchCategories(); // Refresh the list
    } else {
      Swal.fire("Error", "Failed to update category status", "error");
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
      {error && <p className="error-message">{error}</p>} {/* Display error message */}

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
