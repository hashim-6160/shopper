import { useSelector, useDispatch } from "react-redux";
import "./CartItems.css";
import remove_icon from "../Assets/Frontend_Assets/cart_cross_icon.png";
import Swal from "sweetalert2"; // Import SweetAlert
import {
  getCartAsync,
  incrementQuantity,
  decrementQuantity,
  deleteCartAsync,
} from "../../redux/cart";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const CartItems = () => {
  const dispatch = useDispatch();

  // Access cart data from the Redux store
  const { cart: all_product, status } = useSelector((state) => state.cart);

  console.log(all_product, "Cart Data");

  // Fetch cart data on component mount
  useEffect(() => {
    dispatch(getCartAsync());
  }, [dispatch]);

  // Calculate total amount only if products exist
  const totalCartAmount = all_product?.products
    ? all_product.products.reduce(
        (total, item) => total + item.productId.new_price * item.quantity,
        0
      )
    : 0;

  // Handle loading and error states
  if (status === "loading") {
    return <p>Loading cart items...</p>;
  }

  if (status === "failed") {
    return <p>Error loading cart items.</p>;
  }

  // SweetAlert for item removal
  const handleRemove = (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteCartAsync(productId)); // Dispatch the remove action
        Swal.fire("Deleted!", "Your item has been removed.", "success");
      }
    });
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {/* Check if products exist before mapping */}
      {all_product && all_product.products && all_product.products.length > 0 ? (
        all_product.products.map((item) => (
          <div key={item.productId._id}>
            <div className="cartitems-format cartitems-format-main">
              <img
                className="carticon-product-icon"
                src={
                  item.productId.images && item.productId.images.length > 0
                    ? item.productId.images[0]
                    : "default_image_path.png"
                } // Fallback to a default image
                alt={item.productId.name}
              />
              <p>{item.productId.name}</p>
              <p>${item.productId.new_price}</p>
              {/* Quantity control buttons */}
              <div className="cartitems-quantity-controls">
                <button
                  onClick={() =>
                    dispatch(decrementQuantity(item.productId._id))
                  }
                >
                  -
                </button>
                <span className="cartitems-quantity">{item.quantity}</span>
                <button
                  onClick={() =>
                    dispatch(incrementQuantity(item.productId._id))
                  }
                >
                  +
                </button>
              </div>
              <p>${item.productId.new_price * item.quantity}</p>
              <img
                className="cartitems-remove-icon"
                src={remove_icon}
                onClick={() => handleRemove(item.productId._id)} // Call SweetAlert before removing
                alt="remove"
              />
            </div>
            <hr />
          </div>
        ))
      ) : (
        <p>No items in the cart.</p> // Display message if the cart is empty
      )}
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Total</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>${totalCartAmount}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>${totalCartAmount}</h3>
            </div>
          </div>
          <Link to="/checkout">
            <button>PROCEED TO CHECKOUT</button>
          </Link>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="Promo Code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
