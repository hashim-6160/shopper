import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCartAsync, clearCart } from "../../redux/cart";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2
import "./Checkout.css";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart.cart); // Fetch cart data from Redux state
  const [addresses, setAddresses] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    dispatch(getCartAsync());
  }, [dispatch]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch("http://localhost:4000/getaddresses", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setAddresses(data.addresses);
        setSelectedAddress(data.addresses[0]); // Select the first address by default
      } catch (error) {
        console.error("Failed to fetch addresses", error);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    const totalCartAmount = cart?.products
      ? cart.products.reduce(
          (total, item) => total + item.productId.new_price * item.quantity,
          0
        )
      : 0;
    if (cart && cart.products) {
      setSubtotal(totalCartAmount);
      const calculatedGst = totalCartAmount * 0.18;
      setGstAmount(calculatedGst);
      setTotal(totalCartAmount + calculatedGst);
    }
  }, [cart]);

  const handleAddressChange = (e) => {
    const selectedId = e.target.value;
    const selected = addresses.find((addr) => addr._id === selectedId);
    setSelectedAddress(selected);
  };

  const handlePaymentChange = (method) => {
    setSelectedPayment(method);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information",
        text: "Please select a delivery address and payment method.",
      });
      return;
    }

    const userInfo = localStorage.getItem("user-info");
    if (!userInfo) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "You need to log in to place an order.",
      });
      return;
    }

    try {
      const orderData = {
        address: {
          street: selectedAddress.address,
          city: selectedAddress.city,
          postalCode: selectedAddress.pincode,
          country: selectedAddress.state,
        },
        paymentMethod: selectedPayment,
        products: cart.products.map((item) => ({
          productId: item.productId._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: total,
      };

      const response = await fetch("http://localhost:4000/createorder", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "user-info": userInfo,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Order Failed",
          text: `Failed to place the order: ${errorData.error || "Unknown error"}`,
        });
        return;
      }

      const data = await response.json();

      
      Swal.fire({
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/");
          dispatch(clearCart());
        }
      }); 
    } catch (error) {
      console.error("Failed to place order", error);
      Swal.fire({
        icon: "error",
        title: "Order Error",
        text: "Failed to place the order. Please try again.",
      });
    }
  };

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <p>Your cart is empty. Please add items to your cart before proceeding.</p>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-left-section">
        <h1 className="checkout-title">CHECKOUT</h1>
        <div className="product-gallery">
          {cart.products.map((item) => (
            <div key={item.productId._id} className="product-card">
              <img
                src={item.productId.images[0]} // Assuming images array exists
                alt={item.productId.name}
                className="product-image"
              />
              <div className="product-details">
                <p className="product-name">{item.productId.name}</p>
                <p className="product-brand">{item.productId.brand}</p>
                <p className="product-description">
                  {item.productId.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="arrival-date">
          Arrives By {new Date().toLocaleDateString()}
        </p>
        <div className="delivery-address-section">
          <h2 className="address-title">Delivery Address</h2>
          <select
            value={selectedAddress ? selectedAddress._id : ""}
            onChange={handleAddressChange}
            className="address-select"
          >
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <option key={addr._id} value={addr._id}>
                  {addr.name} - {addr.addressType}
                </option>
              ))
            ) : (
              <option disabled>No addresses available</option>
            )}
          </select>

          {selectedAddress && (
            <div className="selected-address-details">
              <p>{selectedAddress.name}</p>
              <p>{selectedAddress.address}</p>
              <p>{selectedAddress.city}</p>
              <p>{selectedAddress.pincode}</p>
              <p>{selectedAddress.state}</p>
              <p>Mobile: {selectedAddress.mobile}</p>
            </div>
          )}
        </div>
        <div className="payment-method-section">
          <h2 className="payment-title">Payment Method</h2>
          {[
            "Debit Card / Credit Card",
            "UPI Method",
            "Internet Banking",
            "Wallet",
            "Cash on Delivery",
          ].map((method, index) => (
            <div key={index} className="payment-option">
              <input
                type="radio"
                id={`payment-${index}`}
                name="payment"
                value={method}
                checked={selectedPayment === method}
                onChange={() => handlePaymentChange(method)}
              />
              <label htmlFor={`payment-${index}`}>{method}</label>
            </div>
          ))}
        </div>
        <button onClick={handlePlaceOrder} className="place-order-button">
          Place Order
        </button>
      </div>
      <div className="checkout-right-section">
        <div className="order-summary-section">
          <h2 className="order-summary-title">ORDER SUMMARY</h2>
          <div className="summary-row">
            <span>{cart.products.length} ITEMS</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Charges</span>
            <span>Free</span>
          </div>
          <div className="summary-row">
            <span>GST Amount</span>
            <span>₹{gstAmount.toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>TOTAL</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <button onClick={handlePlaceOrder} className="place-order-button">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
