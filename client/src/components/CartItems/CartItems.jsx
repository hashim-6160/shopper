import { useSelector, useDispatch } from "react-redux";
import "./CartItems.css";
import remove_icon from "../Assets/Frontend_Assets/cart_cross_icon.png";
import Swal from "sweetalert2";
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
  const { cart: all_product, status } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(getCartAsync());
  }, [dispatch]);

  const totalCartAmount = all_product?.products
    ? all_product.products.reduce(
        (total, item) => total + item.productId.new_price * item.quantity,
        0
      )
    : 0;

  if (status === "loading") {
    return <p>Loading cart items...</p>;
  }

  if (status === "failed") {
    return <p>Error loading cart items.</p>;
  }

  const getStockForSize = (product, size) => {
    // Handle both Map and Object formats of stock data
    if (!product.stock) {
      return 0;
    }
    
    // If stock is stored as an object
    if (typeof product.stock === 'object' && !Array.isArray(product.stock)) {
      return product.stock[size] || 0;
    }
    
    // If stock is stored as a Map (converted to array in JSON)
    if (Array.isArray(product.stock)) {
      const stockEntry = product.stock.find(entry => entry[0] === size);
      return stockEntry ? stockEntry[1] : 0;
    }
    
    return 0;
  };

  const handleIncrement = (item) => {
    console.log("mmmmmm")
    const stockForSize = getStockForSize(item.productId, item.size);
    
    console.log('Stock information:', {
      productId: item.productId._id,
      size: item.size,
      stockForSize: stockForSize,
      fullStock: item.productId.stock
    });

    if (stockForSize === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Out of Stock',
        text: `Size ${item.size} is currently out of stock`
      });
      return;
    }
    
    if (item.quantity >= stockForSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock Limit Reached',
        text: `Only ${stockForSize} items available in size ${item.size}`
      });
      return;
    }

    dispatch(incrementQuantity({ 
      productId: item.productId._id, 
      size: item.size,
      stockForSize: stockForSize
    }
     
    )).catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update quantity'
      });
    });
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      dispatch(decrementQuantity({ 
        productId: item.productId._id, 
        size: item.size 
      })).catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to update quantity'
        });
      });
    } else {
      handleRemove(item.productId._id);
    }
  };

  const handleRemove = (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!"
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteCartAsync(productId));
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
      {all_product?.products?.length > 0 ? (
        all_product.products.map((item) => {
          const currentStock = getStockForSize(item.productId, item.size);
          return (
            <div key={item.productId._id}>
              <div className="cartitems-format cartitems-format-main">
                <img
                  className="carticon-product-icon"
                  src={
                    item.productId.images?.[0] || "default_image_path.png"
                  }
                  alt={item.productId.name}
                />
                <p>
                  {item.productId.name} (Size: {item.size})
                  {currentStock < 5 && currentStock > 0 && (
                    <span className="stock-warning">
                      Only {currentStock} left!
                    </span>
                  )}
                </p>
                <p>${item.productId.new_price}</p>
                <div className="cartitems-quantity-controls">
                  <button
                    onClick={() => handleDecrement(item)}
                    className="quantity-button"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="cartitems-quantity">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(item)}
                    className="quantity-button"
                   
                  >
                    +
                  </button>
                </div>
                <p>${item.productId.new_price * item.quantity}</p>
                <img
                  className="cartitems-remove-icon"
                  src={remove_icon}
                  onClick={() => handleRemove(item.productId._id)}
                  alt="remove"
                />
              </div>
              <hr />
            </div>
          );
        })
      ) : (
        <p>No items in the cart.</p>
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
      </div>
    </div>
  );
};

export default CartItems;