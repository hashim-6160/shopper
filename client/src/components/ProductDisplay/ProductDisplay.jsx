import React, { useContext } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/Frontend_Assets/star_icon.png";
import star_dull_icon from "../Assets/Frontend_Assets/star_dull_icon.png";
import { ShopContext } from "../../context/ShopContext";

const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart } = useContext(ShopContext);

  // Check if product and its properties exist before rendering
  if (!product || !product.images || !product.name) {
    return null; // Or return some loading/fallback UI
  }

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
          <img src={star_icon} alt="Star" />
          <img src={star_icon} alt="Star" />
          <img src={star_icon} alt="Star" />
          <img src={star_icon} alt="Star" />
          <img src={star_dull_icon} alt="Star Dull" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">
            ${product.old_price}
          </div>
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
        <button onClick={() => addToCart(product.id)}>ADD TO CART</button>
        <p className="productdisplay-right-category">
          <span>Brand :</span> {product.brand}
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
