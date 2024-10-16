import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "./AddProduct.css";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../cropImage"; // A helper function for cropping images

const AddProduct = () => {
  const [images, setImages] = useState([]); // Store cropped images
  const [croppedImages, setCroppedImages] = useState([]); // Store cropped image URLs
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

  const [cropConfig, setCropConfig] = useState({
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 1 / 1,
    croppedAreaPixels: null,
    imageSrc: null,
  });
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null); // Track which image is being cropped

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

  const imageHandler = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file)); // Create image URLs

    // Open the crop modal for the first image
    setCurrentImageIndex(0);
    setCropConfig({ ...cropConfig, imageSrc: newImages[0] });
    setShowCropModal(true);
    setImages(newImages); // Store the URLs
  };

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCropConfig((prev) => ({ ...prev, croppedAreaPixels }));
  }, []);

  const saveCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(cropConfig.imageSrc, cropConfig.croppedAreaPixels);
      setCroppedImages((prev) => [...prev, croppedImage]); // Store cropped image
      setShowCropModal(false); // Close crop modal

      // Move to the next image if available
      if (currentImageIndex + 1 < images.length) {
        setCurrentImageIndex(currentImageIndex + 1);
        setCropConfig({ ...cropConfig, imageSrc: images[currentImageIndex + 1] });
        setShowCropModal(true);
      } else {
        // All images processed
        setShowCropModal(false);
      }
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const sizeHandler = (e) => {
    const { value, checked } = e.target;
    setProductDetails((prevDetails) => {
      const updatedSizes = checked
        ? [...prevDetails.size, value]
        : prevDetails.size.filter((size) => size !== value);
      return { ...prevDetails, size: updatedSizes };
    });
  };

  const validateProductDetails = () => {
    const { name, description, category, new_price, old_price, brand, stock, targetGroup, size } = productDetails;

    if (!name.trim() || !description.trim() || !brand.trim() || !targetGroup.trim()) {
      Swal.fire("Validation Error", "Please fill out all fields.", "warning");
      return false;
    }

    if (!category) {
      Swal.fire("Validation Error", "Please select a category.", "warning");
      return false;
    }

    if (isNaN(new_price) || new_price <= 0) {
      Swal.fire("Validation Error", "Offer price must be a positive number.", "warning");
      return false;
    }

    if (isNaN(old_price) || old_price <= 0) {
      Swal.fire("Validation Error", "Price must be a positive number.", "warning");
      return false;
    }

    if (isNaN(stock) || stock <= 0) {
      Swal.fire("Validation Error", "Stock must be a positive number.", "warning");
      return false;
    }

    if (size.length === 0) {
      Swal.fire("Validation Error", "Please select at least one size.", "warning");
      return false;
    }

    if (croppedImages.length === 0) {
      Swal.fire("Validation Error", "Please upload at least one image.", "warning");
      return false;
    }

    return true;
  };

  const Add_Product = async () => {
    if (!validateProductDetails()) return;

    let product = { ...productDetails, images: croppedImages }; // Use cropped images
    let formData = new FormData();
    croppedImages.forEach((image) => {
      formData.append("productImages", image)}); // Append each cropped image to FormData

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
          Swal.fire("Success", "Product Added Successfully!", "success");
        } else {
          Swal.fire("Error", "Failed to add product.", "error");
        }
      } else {
        Swal.fire("Error", "Failed to upload images.", "error");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      Swal.fire("Error", "An error occurred while adding the product.", "error");
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
          <option value="">Select Category</option>
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
        <input
          value={productDetails.targetGroup}
          onChange={changeHandler}
          type="text"
          name="targetGroup"
          placeholder="e.g., Men, Women, Kids"
        />
      </div>

      {/* Size Selection */}
      <div className="addproduct-itemfield">
        <p>Sizes</p>
        <div className="addproduct-sizes">
          {["S", "M", "L", "XL"].map((size) => (
            <div key={size}>
              <input
                type="checkbox"
                value={size}
                checked={productDetails.size.includes(size)}
                onChange={sizeHandler}
              />
              <label>{size}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Images */}
      <div className="addproduct-upload">
        <p>Upload Product Images</p>
        <input
          type="file"
          multiple
          onChange={imageHandler}
          accept="image/*"
        />
        {images.length > 0 && (
          <div className="uploaded-images">
            {images.map((img, index) => (
              <img key={index} src={img} alt={`Preview ${index}`} />
            ))}
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="crop-modal">
          <div className="cropper-container">
            <Cropper
              image={cropConfig.imageSrc}
              crop={cropConfig.crop}
              zoom={cropConfig.zoom}
              aspect={cropConfig.aspect}
              onCropChange={(newCrop) => setCropConfig((prev) => ({ ...prev, crop: newCrop }))}
              onZoomChange={(newZoom) => setCropConfig((prev) => ({ ...prev, zoom: newZoom }))}
              onCropComplete={handleCropComplete}
            />
            <button onClick={saveCroppedImage}>Save Cropped Image</button>
          </div>
        </div>
      )}

      {/* Add Product Button */}
      <button onClick={Add_Product}>Add Product</button>
    </div>
  );
};

export default AddProduct;
