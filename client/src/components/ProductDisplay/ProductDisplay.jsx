import React, { useState } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/Frontend_Assets/star_icon.png";
import star_dull_icon from "../Assets/Frontend_Assets/star_dull_icon.png";
import { useDispatch } from "react-redux";
import { addToCartAsync } from "../../redux/cart";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2

const ProductDisplay = (props) => {
  const { product } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addtocart = async (product) => {
    const userToken = localStorage.getItem("user-info");
    if (!userToken) {
      Swal.fire({
        title: "Not Logged In!",
        text: "You need to log in to add products to your cart.",
        icon: "warning",
        confirmButtonText: "Login",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } else {
      setIsAddingToCart(true);
      try {
        await dispatch(addToCartAsync(product._id));
        setIsAddingToCart(false);

        // Success alert when the product is added to the cart
        Swal.fire({
          title: "Added to Cart!",
          text: `${product.name} has been added to your cart.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        setIsAddingToCart(false);

        // Error alert if there's an issue adding to cart
        Swal.fire({
          title: "Error!",
          text: "There was an issue adding the product to the cart.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  if (!product || !product.images || !product.name) {
    return null; // Return fallback or loader UI
  }

  // Function to render star ratings dynamically
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<img key={i} src={star_icon} alt="Star" />);
    }
    for (let i = fullStars; i < 5; i++) {
      stars.push(<img key={i} src={star_dull_icon} alt="Star Dull" />);
    }
    return stars;
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          {product.images.slice(1, 5).map((img, index) => (
            <img key={index} src={img} alt={`Product ${index + 1}`} />
          ))}
        </div>

        <div className="productdisplay-img">
          <img
            className="productdisplay-main-img"
            src={product.images[0]}
            alt="Main product"
          />
        </div>
      </div>

      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          {renderStars(4)} {/* Assume a static rating of 4 for now */}
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          {product.old_price && (
            <div className="productdisplay-right-price-old">
              ${product.old_price}
            </div>
          )}
          <div className="productdisplay-right-price-new">
            ${product.new_price}
          </div>
        </div>
        <div className="productdisplay-right-description">
          {product.description}
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        <button
          onClick={() => addtocart(product)}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? "ADDING..." : "ADD TO CART"}
        </button>
        <p className="productdisplay-right-category">
          <span>Brand :</span> {product.brand}
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
