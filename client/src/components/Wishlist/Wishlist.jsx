import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, ShoppingCart } from "lucide-react";
import { addToCartAsync, fetchWishlistAsync, removeFromWishlistAsync } from "../../redux/cart";
import { useLocation, Navigate } from 'react-router-dom';

const WishlistPage = () => {
  const dispatch = useDispatch();

  const location = useLocation();

  const reloadPage = () => {
    // By using state in Navigate, you can force the component to re-render
    return <Navigate to={location.pathname} state={{ reload: true }} />;
  };

  // Fetch the wishlist and status from the Redux store
  const { wishlist, status } = useSelector(state => state.cart || { wishlist: { products: [] } });

  useEffect(() => {
    
    dispatch(fetchWishlistAsync());
    
  }, [dispatch],reloadPage);

  // Log the wishlist data for debugging purposes
  console.log("Wishlist Data from wishlist:", wishlist);
 

  if (status === 'loading') {
    return <div>Loading Wishlist...</div>;
  }

  // Safeguard if wishlist.products is undefined or the array is empty
  if (!wishlist || !Array.isArray(wishlist.products.products) || wishlist.products.products.length === 0) {
    return (
      <div className="wishlist__empty">
        <h2>Your Wishlist is Empty</h2>
        <p>Start adding items to your wishlist!</p>
      </div>
    );
  }

  return (
    <div className="wishlist__container">
      <div className="wishlist__content">
        <h2>Your Wishlist</h2>
        <p>Total {wishlist.products.products.length} items in your wishlist</p>
        {wishlist.products.products.map((item) => {
          const stock = item.productId.stock || 0; // Access stock directly from the product item

          return (
            <div key={item.productId._id} className="wishlist__item">
              <img
                src={item.productId.images && item.productId.images[0]} // Check if images exist
                alt={item.productId.name}
                className="wishlist__item-image"
              />
              <div className="wishlist__item-details">
                <h3 className="wishlist__item-name">{item.productId.name}</h3>
                <p className="wishlist__item-category">Category: {item.productId.category}</p>
                <p className="wishlist__item-category">Size: {item.size}</p>
                <p className="wishlist__item-price">₹ {item.productId.new_price.toLocaleString()}</p>

                {stock === 0 ? (
                  <p className="wishlist__item-stock wishlist__item-stock--out">Out of Stock</p>
                ) : (
                  <p className="wishlist__item-stock wishlist__item-stock--in">In Stock</p>
                )}
              </div>
              <div className="wishlist__actions">
                <button
                  className={`wishlist__action-button wishlist__action-button--cart ${stock === 0 ? "wishlist__action-button--disabled" : ""}`}
                  onClick={() => dispatch(addToCartAsync({ itemId: item.productId._id, size: item.size }))}
                  disabled={stock === 0}
                >
                  <ShoppingCart className="wishlist__action-icon" size={16} />
                  Add to Cart
                </button>
                <Trash2
                  className="wishlist__action-icon wishlist__action-icon--delete"
                  onClick={() => dispatch(removeFromWishlistAsync({ productId: item.productId._id, size: item.size }))}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
