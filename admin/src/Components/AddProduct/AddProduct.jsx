import React, { useState, useEffect } from "react";
import "./AddProduct.css";
import upload_area from "../../assets/Admin_Assets/upload_area.svg";

const AddProduct = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    category: "",
    new_price: "",
    old_price: "",
    brand: "",
    stock: "",
    targetGroup: "", // New target group field
  });

  useEffect(() => {
    // Fetch categories from the server to populate the select options
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4000/categories");
      const data = await response.json();
      // Filter categories to show only active ones
      const activeCategories = data.filter((category) => category.isActive);
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const imageHandler = (e) => {
    setImages([...e.target.files]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const validateProductDetails = () => {
    const {
      name,
      description,
      category,
      new_price,
      old_price,
      brand,
      stock,
      targetGroup,
    } = productDetails;

    // Basic validation: check if fields are empty or contain only spaces
    if (
      !name.trim() ||
      !description.trim() ||
      !brand.trim() ||
      !targetGroup.trim()
    ) {
      alert("Please fill out all fields without spaces.");
      return false;
    }

    // Check if category is selected
    if (!category) {
      alert("Please select a category.");
      return false;
    }

    // Check if new price and old price are valid numbers and greater than zero
    if (isNaN(new_price) || new_price <= 0) {
      alert("Offer price must be a positive number.");
      return false;
    }

    if (isNaN(old_price) || old_price <= 0) {
      alert("Price must be a positive number.");
      return false;
    }

    // Check if stock is a valid number and greater than zero
    if (isNaN(stock) || stock <= 0) {
      alert("Stock must be a positive number.");
      return false;
    }

    // Ensure at least one image is uploaded
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return false;
    }

    return true;
  };

  const Add_Product = async () => {
    if (!validateProductDetails()) return;

    let product = { ...productDetails, images: [] };
    let formData = new FormData();
    images.forEach((image) => formData.append("productImages", image));

    try {
      const uploadResponse = await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
      const responseData = await uploadResponse.json();

      if (responseData.success) {
        product.images = responseData.images;

        const addProductResponse = await fetch(
          "http://localhost:4000/addproduct",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(product),
          }
        );

        const result = await addProductResponse.json();
        if (result.success) {
          alert("Product Added");
        } else {
          alert("Failed to add product");
        }
      } else {
        alert("Failed to upload images");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("An error occurred while adding the product.");
    }
  };

  return (
    <div className="add-product">
      {/* Product Title */}
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type Here"
        />
      </div>

      {/* Description */}
      <div className="addproduct-itemfield">
        <p>Description</p>
        <textarea
          value={productDetails.description}
          onChange={changeHandler}
          name="description"
          placeholder="Enter product description"
        />
      </div>

      {/* Price and Offer Price */}
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name="old_price"
            placeholder="Type Here"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder="Type Here"
          />
        </div>
      </div>

      {/* Brand */}
      <div className="addproduct-itemfield">
        <p>Brand</p>
        <input
          value={productDetails.brand}
          onChange={changeHandler}
          type="text"
          name="brand"
          placeholder="Brand Name"
        />
      </div>

      {/* Stock */}
      <div className="addproduct-itemfield">
        <p>Stock</p>
        <input
          value={productDetails.stock}
          onChange={changeHandler}
          type="number"
          name="stock"
          placeholder="Available Stock"
        />
      </div>

      {/* Category */}
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Target Group */}
      <div className="addproduct-itemfield">
        <p>Target Group</p>
        <input
          value={productDetails.targetGroup}
          onChange={changeHandler}
          type="text"
          name="targetGroup"
          placeholder="e.g., Men, Women, Kids"
        />
      </div>

      {/* Image Upload Section */}
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          {images.length === 0 ? (
            <img
              src={upload_area}
              className="addproduct-thumbnail-img"
              alt="Upload"
            />
          ) : (
            <div className="image-preview">
              {Array.from(images).map((image, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(image)}
                  alt={`preview-${index}`}
                  className="addproduct-thumbnail-img"
                />
              ))}
            </div>
          )}
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          hidden
          multiple
        />
      </div>

      {/* Submit Button */}
      <button onClick={Add_Product} className="addproduct-btn">
        ADD
      </button>
    </div>
  );
};

export default AddProduct;
