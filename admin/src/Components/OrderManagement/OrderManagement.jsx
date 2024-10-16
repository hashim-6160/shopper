import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import './OrderManagement.css';  // Import the CSS file

const OrderManagement = () => {
  const [orderData, setOrderData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ordersPerPage = 10;
  const offset = currentPage * ordersPerPage;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:4000/getorders", {
          method: 'GET',
          credentials: 'include', // to include cookies in the request
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrderData(data.data);  // Accessing the 'data' array
        } else {
          console.error("Error fetching orders:", response.status);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const paginatedOrders = orderData.slice(offset, offset + ordersPerPage);
  const pageCount = Math.ceil(orderData.length / ordersPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleDetailsClick = (orderId) => {
    navigate(`/dashboard/ordermanagement/order/${orderId}`);
  };

  return (
    <div className="order-management-container">
      <div className="order-management-content">
        <h2 className="order-title">Orders</h2>

        <div className="order-table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Reference No.</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order._id}</td>
                  <td>{order.referenceNo}</td>
                  <td>{order.totalPrice ? `$${order.totalPrice.toFixed(2)}` : 'N/A'}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    {order.paymentStatus === 'Paid' ? (
                      <span className="order-status">Paid</span>
                    ) : (
                      <span className="order-status">Unpaid</span>
                    )}
                  </td>
                  <td>
                    {order.orderStatus}
                  </td>
                  <td>
                    <button 
                      className="details-button"
                      onClick={() => handleDetailsClick(order._id)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active-page"}
            pageClassName={"page"}
            previousClassName={"prev-button"}
            nextClassName={"next-button"}
            breakClassName={"break-button"}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
