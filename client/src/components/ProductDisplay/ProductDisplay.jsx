import React, { useState } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/Frontend_Assets/star_icon.png";
import star_dull_icon from "../Assets/Frontend_Assets/star_dull_icon.png";
import { useDispatch } from "react-redux";
import { addToCartAsync,addToWishlistAsync } from "../../redux/cart";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ProductDisplay = (props) => {
  const { product } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false); // State for wishlist
  const [selectedSize, setSelectedSize] = useState("");

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
      if (!selectedSize) {
        Swal.fire({
          title: "Select a Size",
          text: "Please select a size before adding the product to your cart.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      setIsAddingToCart(true);
      try {
        await dispatch(addToCartAsync({ itemId: product._id, size: selectedSize }));
        setIsAddingToCart(false);
        Swal.fire({
          title: "Added to Cart!",
          text: `${product.name} (Size: ${selectedSize}) has been added to your cart.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        setIsAddingToCart(false);
        Swal.fire({
          title: "Error!",
          text: "There was an issue adding the product to the cart.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const addtowishlist = async (product) => {
    const userToken = localStorage.getItem("user-info");
    if (!userToken) {
      Swal.fire({
        title: "Not Logged In!",
        text: "You need to log in to add products to your wishlist.",
        icon: "warning",
        confirmButtonText: "Login",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } else {
      setIsAddingToWishlist(true);
      try {
        await dispatch(addToWishlistAsync({ productId: product._id,size: selectedSize }));
        setIsAddingToWishlist(false);
        Swal.fire({
          title: "Added to Wishlist!",
          text: `${product.name} has been added to your wishlist.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        setIsAddingToWishlist(false);
        Swal.fire({
          title: "Error!",
          text: "There was an issue adding the product to the wishlist.",
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
            {Object.entries(product.stock).map(([size, stock]) => (
              <div
                key={size}
                className={`size-option ${stock === 0 ? "disabled" : ""} ${
                  selectedSize === size ? "selected" : ""
                }`}
                onClick={() => stock > 0 && setSelectedSize(size)}
              >
                {size} {stock === 0 ? "(Out of stock)" : ""}
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => addtocart(product)} disabled={isAddingToCart}>
          {isAddingToCart ? "ADDING..." : "ADD TO CART"}
        </button>
        <button onClick={() => addtowishlist(product)} disabled={isAddingToWishlist}>
        {isAddingToWishlist ? "ADDING..." : "ADD TO WISHLIST"}
      </button>

        <p className="productdisplay-right-category">
          <span>Brand :</span> {product.brand}
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
