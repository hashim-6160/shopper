import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import "./AddProduct.css";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../cropImage";

const AddProduct = () => {
  const [images, setImages] = useState([]);
  const [croppedImages, setCroppedImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    category: "",
    new_price: "",
    old_price: "",
    brand: "",
    targetGroup: "",
    size: [],
  });

  const [sizeStock, setSizeStock] = useState({S: 0, M: 0, L: 0, XL: 0, XXL: 0});
  const [cropConfig, setCropConfig] = useState({
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 1 / 1,
    croppedAreaPixels: null,
    imageSrc: null,
  });
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

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
    const newImages = files.map((file) => URL.createObjectURL(file));

    setCurrentImageIndex(0);
    setCropConfig({ ...cropConfig, imageSrc: newImages[0] });
    setShowCropModal(true);
    setImages(newImages);
  };

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCropConfig((prev) => ({ ...prev, croppedAreaPixels }));
  }, []);

  const saveCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(cropConfig.imageSrc, cropConfig.croppedAreaPixels);
      setCroppedImages((prev) => [...prev, croppedImage]);
      setShowCropModal(false);

      if (currentImageIndex + 1 < images.length) {
        setCurrentImageIndex(currentImageIndex + 1);
        setCropConfig({ ...cropConfig, imageSrc: images[currentImageIndex + 1] });
        setShowCropModal(true);
      } else {
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

    if (!checked) {
      setSizeStock((prev) => {
        const { [value]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSizeStockChange = (size, stock) => {
    setSizeStock((prev) => ({ ...prev, [size]: stock }));
  };

  const validateProductDetails = () => {
    const { name, description, category, new_price, old_price, brand, targetGroup, size } = productDetails;

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

    if (size.length === 0) {
      Swal.fire("Validation Error", "Please select at least one size.", "warning");
      return false;
    }

    for (let selectedSize of size) {
      if (!sizeStock[selectedSize] || isNaN(sizeStock[selectedSize]) || sizeStock[selectedSize] <= 0) {
        Swal.fire("Validation Error", `Please enter valid stock for size ${selectedSize}.`, "warning");
        return false;
      }
    }

    if (croppedImages.length === 0) {
      Swal.fire("Validation Error", "Please upload at least one image.", "warning");
      return false;
    }

    return true;
  };

  const Add_Product = async () => {
    if (!validateProductDetails()) return;

    const product = {
      ...productDetails,
      stock: sizeStock, // Send as an object, not an array
      images: croppedImages, // Assuming this is an array of URLs received from the upload
    };

    let formData = new FormData();
    croppedImages.forEach((image) => {
      formData.append("productImages", image);
    });

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

        const addProductResponse = await fetch("http://localhost:4000/addproduct", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        });

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

      {/* Sizes with Stock */}
      <div className="addproduct-itemfield">
        <p>Select Sizes and Stock</p>
        <div className="size-selection">
          {["S", "M", "L", "XL","XXL"].map((size) => (
            <div key={size}>
              <label>
                <input
                  type="checkbox"
                  value={size}
                  onChange={sizeHandler}
                  checked={productDetails.size.includes(size)}
                />
                {size}
              </label>
              {productDetails.size.includes(size) && (
                <input
                  type="number"
                  placeholder="Stock"
                  value={sizeStock[size] || ""}
                  onChange={(e) => handleSizeStockChange(size, parseInt(e.target.value))}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="addproduct-itemfield">
        <p>Select Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
        >
          <option value="">Select</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image Upload */}
      <div className="addproduct-imageupload">
        <input type="file" onChange={imageHandler} multiple />
        {croppedImages.map((image, index) => (
          <img key={index} src={URL.createObjectURL(image)} alt="Product" />
        ))}
      </div>

      {/* Cropper Modal */}
      {showCropModal && (
        <div className="cropper-modal">
          <Cropper
            image={cropConfig.imageSrc}
            crop={cropConfig.crop}
            zoom={cropConfig.zoom}
            aspect={cropConfig.aspect}
            onCropChange={(crop) => setCropConfig((prev) => ({ ...prev, crop }))}
            onCropComplete={handleCropComplete}
            onZoomChange={(zoom) => setCropConfig((prev) => ({ ...prev, zoom }))}
          />
          <button onClick={saveCroppedImage}>Save Cropped Image</button>
        </div>
      )}

      {/* Submit Button */}
      <div className="addproduct-submit">
        <button onClick={Add_Product}>Add Product</button>
      </div>
    </div>
  );
};

export default AddProduct;
