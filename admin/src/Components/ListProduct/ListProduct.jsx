import React, { useEffect, useState } from "react";
import "./ListProduct.css";
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
    stock: "",
    brand: "",
    targetGroup: "",
  });

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

  const toggleProductStatus = async (id, isAvailable) => {
    const url = isAvailable
      ? "http://localhost:4000/removeproduct" // URL for removing product (unlisting)
      : "http://localhost:4000/relistproduct"; // URL for relisting product

    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    // After toggling the product status, fetch all products again to update the UI
    await fetchInfo();
  };

  const startEditingProduct = (product) => {
    setEditingProduct(product); // Set the product to be edited
    setUpdatedProductDetails(product); // Set the form fields with the current product details
  };

  const handleInputChange = (e) => {
    setUpdatedProductDetails({
      ...updatedProductDetails,
      [e.target.name]: e.target.value,
    });
  };

  const submitUpdatedProduct = async () => {
    await fetch("http://localhost:4000/updateproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...updatedProductDetails, id: editingProduct.id }),
    });

    // Clear the editing state and refresh the product list
    setEditingProduct(null);
    await fetchInfo();
  };

  return (
    <div className="list-product">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Status</p>
        <p>Action</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allProducts.map((product, index) => (
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
                {/* Dynamically toggle button text and color */}
                <button
                  onClick={() => toggleProductStatus(product.id, product.available)}
                  className={`listproduct-toggle-button ${
                    product.available ? "remove" : ""
                  }`}
                >
                  {product.available ? "Remove" : "Add"}
                </button>
                <button
                  onClick={() => startEditingProduct(product)} // Edit button
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
          <label>Old Price</label>
          <input
            type="text"
            name="old_price"
            value={updatedProductDetails.old_price}
            onChange={handleInputChange}
          />
          <label>New Price</label>
          <input
            type="text"
            name="new_price"
            value={updatedProductDetails.new_price}
            onChange={handleInputChange}
          />
          <label>Stock</label>
          <input
            type="text"
            name="stock"
            value={updatedProductDetails.stock}
            onChange={handleInputChange}
          />
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
          <button onClick={submitUpdatedProduct}>Save Changes</button>
          <button onClick={() => setEditingProduct(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ListProduct;
