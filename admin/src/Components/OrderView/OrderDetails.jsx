import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './OrderDetails.css'; // Import the CSS file

const OrderDetails = () => {
  const { id } = useParams();  // Get the order ID from the URL
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/getorder/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
          setOrderStatus(data.orderStatus);
          setPaymentStatus(data.paymentStatus);
        } else {
          Swal.fire({
            title: "Error",
            text: `Error fetching order: ${response.status}`,
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: `Error fetching order: ${error.message}`,
          icon: "error",
        });
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleUpdate = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:4000/updateorder/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderStatus, paymentStatus }),
          });

          if (response.ok) {
            Swal.fire({
              title: "Success",
              text: "Order updated successfully!",
              icon: "success",
            }).then(() => {
              navigate("/dashboard/ordermanagement");  // Go back to order management page
            });
          } else {
            Swal.fire({
              title: "Error",
              text: `Error updating order: ${response.status}`,
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: `Error updating order: ${error.message}`,
            icon: "error",
          });
        }
      }
    });
  };

  if (!order) return <div className="loading">Loading...</div>;

  return (
    <div className="order-details-container">
      <h2 className="order-title">Order Details for {order._id}</h2>
      <div className="order-info">
        <h3 className="section-title">Shipping Address</h3>
        <p className="shipping-address">
          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
        </p>

        <h3 className="section-title">Products</h3>
        <ul className="product-list">
          {order.products.map((product, index) => (
            <li key={index} className="product-item">
              {product.name} - {product.quantity} x ${product.price.toFixed(2)}
            </li>
          ))}
        </ul>

        <h3 className="section-title">Update Order Status</h3>
        <label className="status-label">
          Order Status:
          <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="status-select">
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>

        <h3 className="section-title">Update Payment Status</h3>
        <label className="status-label">
          Payment Status:
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="status-select">
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </label>

        <button onClick={handleUpdate} className="update-button">Update Order</button>
      </div>
    </div>
  );
};

export default OrderDetails;
