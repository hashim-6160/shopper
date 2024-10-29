import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import "./ListProduct.css";
import Cropper from "react-easy-crop";
import getCroppedImg from "./getCroppedImg";
import cross_icon from "../../assets/Admin_Assets/cross_icon.png";

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited
  const [updatedProductDetails, setUpdatedProductDetails] = useState({
    name: "",
    description: "",
    old_price: "",
    new_price: "",
    category: "",
    stock: {},
    brand: "",
    targetGroup: "",
    images: [],
  });
  const sizes = ["S", "M", "L", "XL", "XXL"]; // Define available sizes

  // For cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [image, setImage] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 5; // Number of products per page

  const fetchInfo = async () => {
    await fetch("http://localhost:4000/allproducts") // Fetch all products
      .then((resp) => resp.json())
      .then((data) => {
        setAllProducts(data); // Set state for all products
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Set the image for cropping
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = async (crop) => {
    if (!image) return;
    const croppedImage = await getCroppedImg(image, crop); // Use your cropping function
    setCroppedImageUrl(croppedImage); // Save cropped image URL
    setUpdatedProductDetails((prevDetails) => ({
      ...prevDetails,
      images: [...prevDetails.images, croppedImage],
    }));
  };

  const toggleProductStatus = async (id, isAvailable) => {
    const url = isAvailable
      ? "http://localhost:4000/removeproduct" // URL for removing product (unlisting)
      : "http://localhost:4000/relistproduct"; // URL for relisting product

    const actionText = isAvailable ? "Remove" : "Add";

    // Confirmation dialog before toggling status
    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this product?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      await fetchInfo(); // Refresh the product list after toggling

      Swal.fire({
        title: `Product ${actionText}ed successfully!`,
        icon: "success",
      });
    }
  };

  const startEditingProduct = (product) => {
    setEditingProduct(product); // Set the product to be edited
    setUpdatedProductDetails(product); // Set the form fields with the current product details
    setImage(null); // Reset image state for new edit
    setCroppedImageUrl(null); // Reset cropped image URL
  };

  // const handleInputChange = (e) => {
  //   setUpdatedProductDetails({
  //     ...updatedProductDetails,
  //     [e.target.name]: e.target.value,
  //   });
  // };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (name.startsWith("stock")) {
      const size = name.match(/\[(.*?)\]/)[1]; // Extract size from name
      setUpdatedProductDetails((prevDetails) => ({
        ...prevDetails,
        stock: {
          ...prevDetails.stock,
          [size]: value,
        },
      }));
    } else {
      setUpdatedProductDetails({
        ...updatedProductDetails,
        [name]: value,
      });
    }
  };
  

  const submitUpdatedProduct = async () => {
    const formData = new FormData();
    Object.entries(updatedProductDetails).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((img) => {
          // If images are blobs, convert them into File objects
          fetch(img)
            .then((res) => res.blob())
            .then((blob) => {
              formData.append("images", blob, "image.jpg"); // Give each blob a filename
            });
        });
      }else if (key === "stock") {
        // Convert stock object to a format expected by the backend
        Object.entries(value).forEach(([size, stock]) => {
          formData.append(`stock[${size}]`, stock);
        });
        console.log(formData);
        
      }
      else {
        formData.append(key, value);
      }
    });

    formData.append("id", editingProduct.id);

    await fetch("http://localhost:4000/updateproduct", {
      method: "POST",
      body: formData,
    });

    setEditingProduct(null); // Clear editing state
    setCroppedImageUrl(null);
    setImage(null);

    // Show success message
    Swal.fire({
      title: "Product updated successfully!",
      icon: "success",
    });

    await fetchInfo(); // Refresh product list
  };

  const cancelEditing = () => {
    // Confirmation dialog for canceling edit
    Swal.fire({
      title: "Are you sure you want to cancel the edit?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        setEditingProduct(null);
      }
    });
  };

  // Pagination logic
  const offset = currentPage * productsPerPage;
  const paginatedProducts = allProducts.slice(offset, offset + productsPerPage);
  const pageCount = Math.ceil(allProducts.length / productsPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <div className="list-product">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p> Price</p>
        <p>Offer Price</p>
        <p>Category</p>
        <p>Status</p>
        <p>Action</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {paginatedProducts.map((product, index) => (
          <React.Fragment key={index}>
            <div className="listproduct-format-main listproduct-format">
              <img
                src={product.images[0]}
                alt=""
                className="listproduct-product-icon"
              />
              <p>{product.name}</p>
              <p>${product.old_price}</p>
              <p>${product.new_price}</p>
              <p>{product.targetGroup}</p>
              <p>{product.available ? "Available" : "Unlisted"}</p>
              <div className="listproduct-actions">
                <button
                  onClick={() =>
                    toggleProductStatus(product.id, product.available)
                  }
                  className={`listproduct-toggle-button ${
                    product.available ? "remove" : ""
                  }`}
                >
                  {product.available ? "Remove" : "Add"}
                </button>
                <button
                  onClick={() => startEditingProduct(product)}
                  className="listproduct-edit-button"
                >
                  Edit
                </button>
              </div>
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>

      {/* Edit Product Form */}
      {editingProduct && (
        <div className="edit-product-form">
          <h2>Edit Product</h2>
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={updatedProductDetails.name}
            onChange={handleInputChange}
          />
          <label>Description</label>
          <textarea
            name="description"
            value={updatedProductDetails.description}
            onChange={handleInputChange}
          />
          <label>Price</label>
          <input
            type="text"
            name="old_price"
            value={updatedProductDetails.old_price}
            onChange={handleInputChange}
          />
          <label>Offer Price</label>
          <input
            type="text"
            name="new_price"
            value={updatedProductDetails.new_price}
            onChange={handleInputChange}
          />
          {/* Stock Inputs */}
          {sizes.map((size) => (
            <div key={size}>
              <label>{size}</label>
              <input
                type="number"
                name={`stock[${size}]`}
                value={updatedProductDetails.stock[size] || ""}
                onChange={handleInputChange}
              />
            </div>
          ))}

          {/* <label>Stock</label>
          <input
            type="text"
            name="stock"
            value={updatedProductDetails.stock}
            onChange={handleInputChange}
          /> */}
          <label>Brand</label>
          <input
            type="text"
            name="brand"
            value={updatedProductDetails.brand}
            onChange={handleInputChange}
          />
          <label>Target Group</label>
          <input
            type="text"
            name="targetGroup"
            value={updatedProductDetails.targetGroup}
            onChange={handleInputChange}
          />
          <label>Upload New Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {image && (
            <div
              style={{ position: "relative", height: "300px", width: "100%" }}
            >
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          )}
          {croppedImageUrl && (
            <div className="cropped-image-preview">
              <h3>Cropped Image Preview</h3>
              <img
                src={croppedImageUrl}
                alt="Cropped"
                style={{ width: "100px", height: "100px" }}
              />
            </div>
          )}
          <button onClick={submitUpdatedProduct}>Save Changes</button>
          <button onClick={cancelEditing} className="cancel-edit-button">
            Cancel
          </button>
        </div>
      )}
      {/* Pagination Component */}
      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        pageCount={pageCount}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
    </div>
  );
};

export default ListProduct;
