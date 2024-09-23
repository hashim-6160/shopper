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
    targetGroup: "",  
    size: [],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4000/categories");
      const data = await response.json();
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

  const sizeHandler = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setProductDetails({
        ...productDetails,
        size: [...productDetails.size, value],
      });
    } else {
      setProductDetails({
        ...productDetails,
        size: productDetails.size.filter((size) => size !== value),
      });
    }
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
      size,
    } = productDetails;

    if (
      !name.trim() ||
      !description.trim() ||
      !brand.trim() ||
      !targetGroup.trim()
    ) {
      alert("Please fill out all fields without spaces.");
      return false;
    }

    if (!category) {
      alert("Please select a category.");
      return false;
    }

    if (isNaN(new_price) || new_price <= 0) {
      alert("Offer price must be a positive number.");
      return false;
    }

    if (isNaN(old_price) || old_price <= 0) {
      alert("Price must be a positive number.");
      return false;
    }

    if (isNaN(stock) || stock <= 0) {
      alert("Stock must be a positive number.");
      return false;
    }

    if (size.length === 0) {
      alert("Please select at least one size.");
      return false;
    }

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
          name="category"
          value={productDetails.category}
          onChange={changeHandler}
        >
          <option value="" disabled>
            Choose Category
          </option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Target Group */}
      <div className="addproduct-itemfield">
        <p>Target Group</p>
        <select
          name="targetGroup"
          value={productDetails.targetGroup}
          onChange={changeHandler}
        >
          <option value="" disabled>
            Choose Target Group
          </option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>
      </div>

      {/* Sizes */}
      <div className="addproduct-itemfield">
        <p>Select Sizes</p>
        <label>
          <input
            type="checkbox"
            name="sizes"
            value="S"
            onChange={sizeHandler}
          />{" "}
          S
        </label>
        <label>
          <input
            type="checkbox"
            name="sizes"
            value="M"
            onChange={sizeHandler}
          />{" "}
          M
        </label>
        <label>
          <input
            type="checkbox"
            name="sizes"
            value="L"
            onChange={sizeHandler}
          />{" "}
          L
        </label>
        <label>
          <input
            type="checkbox"
            name="sizes"
            value="XL"
            onChange={sizeHandler}
          />{" "}
          XL
        </label>
        <label>
          <input
            type="checkbox"
            name="sizes"
            value="XXL"
            onChange={sizeHandler}
          />{" "}
          XXL
        </label>
      </div>

      {/* Image Upload */}
      <div className="uploadfile">
        <p>Upload Your Product Image</p>
        <div className="drag_area">
          <div className="drag-area-content">
            <img src={upload_area} alt="upload" />
            <p>Drag Your Image Here</p>
            <input
              type="file"
              onChange={imageHandler}
              multiple
              id="upload-image"
            />
            <label htmlFor="upload-image">Or select file</label>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <button onClick={Add_Product} className="addproduct-btn">
        Add
      </button>
    </div>
  );
};

export default AddProduct;
