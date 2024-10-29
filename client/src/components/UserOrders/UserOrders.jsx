import React, { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2
import "./UserOrders.css";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch orders with pagination
  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/getorder?page=${page}&limit=3`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("orderData", data);

      // Set orders and pagination data
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch order data");
      setLoading(false);
    }
  };

  // Fetch orders when the component mounts or when currentPage changes
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  // Handle returning a product
  const handleReturnOrder = async (orderId,productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to return this product.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, return it!",
      cancelButtonText: "No, keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:4000/returnOrder/${orderId}/${productId}`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "user-info": `${localStorage.getItem("user-info")}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            Swal.fire("Returned!", "Product returned successfully.", "success");
            fetchOrders(currentPage); // Refetch the orders to get updated data
          } else {
            Swal.fire("Error", "Failed to return the product.", "error");
          }
        } catch (err) {
          console.error("Error returning product:", err);
          Swal.fire("Error", "Failed to return the product.", "error");
        }
      }
    });
  };

  // Handle canceling a product order
  const handleCancelOrder = async (orderId, productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to cancel this product order.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:4000/cancelOrder/${orderId}/${productId}`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "user-info": `${localStorage.getItem("user-info")}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            Swal.fire("Canceled!", "Order canceled successfully.", "success");
            fetchOrders(currentPage); // Refetch the orders to get updated data
          } else {
            Swal.fire("Error", "Failed to cancel the order.", "error");
          }
        } catch (err) {
          console.error("Error canceling order:", err);
          Swal.fire("Error", "Failed to cancel the order.", "error");
        }
      }
    });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  return (
    <div className="container">
      <h1 className="order-title">Your Orders</h1>

      {/* Map through the list of orders */}
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order._id} className="order">
            <div className="order-details">
              <div className="order-info">
                <p>Order ID: {order._id}</p>
                <p>
                  Order Date: {new Date(order.createdAt).toLocaleDateString() || "Date not available"}
                </p>
                {order.shippingAddress ? (
                  <p>
                    Ship To:{" "}
                    {`${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`}
                  </p>
                ) : (
                  <p>Shipping details not available.</p>
                )}
              </div>

              <div className="order-summary">
                <p className="total">Total: ₹{order.totalPrice?.toLocaleString() || "0"}</p>
                <p>
                  Status:{" "}
                  <span className={`status ${order.orderStatus?.toLowerCase()}`}>
                    {order.orderStatus || "Status not available"}
                  </span>
                </p>
                <p>Payment Method: {order.paymentMethod || "N/A"}</p>
                <p>Payment Status: {order.paymentStatus || "N/A"}</p>
              </div>
            </div>

            {/* Product List */}
            <h2 className="product-title">Products</h2>
            {order.products.length > 0 ? (
              order.products.map((product) => (
                <div key={product.productId} className="product">
                  <div className="product-info">
                    <p className="product-name">{product.name || "Product name not available"}</p>
                    <p>Quantity: {product.quantity || "N/A"}</p>
                    <p>Price: ₹{product.price?.toLocaleString() || "0"}</p>
                    <p>Status: {product.status || "N/A"}</p>
                  </div>
                  <div className="product-actions">
                    {/* Display the Return button only if the product status is "Delivered" */}
                    {product.status === "Delivered" && (
                      <button
                        className="btn btn-return"
                        onClick={() => handleReturnOrder(order._id,product.productId)}
                      >
                        Return product
                      </button>
                    )}
                    {/* Display the Cancel button only if the product status is NOT "Delivered" */}
                    {product.status !== "Delivered" && product.status !== "Cancelled" && (
                      <button
                        className="btn btn-cancel"
                        onClick={() => handleCancelOrder(order._id, product.productId)}
                      >
                        Cancel order
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No products in this order.</p>
            )}

            {/* Last Updated */}
            <div className="last-updated">
              <p>
                <strong>Last Updated On:</strong> {new Date(order.updatedAt).toLocaleDateString() || "Not available"}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>No orders found.</p>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default UserOrders;
