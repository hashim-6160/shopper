import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:4000/availableproducts");
        const data = await res.json();
        console.log("Fetched Products: ", data);
        setAll_Product(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const fetchCart = async () => {
      if (localStorage.getItem("user-info")) {
        try {
          const res = await fetch("http://localhost:4000/getcart", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "user-info": `${localStorage.getItem("user-info")}`,
              "Content-Type": "application/json",
            },
            body: "",
          });
          const data = await res.json();
          console.log("Fetched Cart Data:", data);
          setCartItems(data);
        } catch (error) {
          console.error("Error fetching cart:", error);
        }
      } else {
        setCartItems(getDefaultCart());
      }
    };

    fetchProducts();
    fetchCart();
  }, []);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));

    if (localStorage.getItem("user-info")) {
      try {
        const res = await fetch("http://localhost:4000/addtocart", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId: itemId }),
        });
        const data = await res.json();
        console.log(data);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: Math.max(prev[itemId] - 1, 0) }));

    if (localStorage.getItem("user-info")) {
      try {
        const res = await fetch("http://localhost:4000/removefromcart", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId: itemId }),
        });
        const data = await res.json();
        console.log(data);
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  const incrementQuantity = (itemId) => {
    addToCart(itemId);
  };

  const decrementQuantity = (itemId) => {
    if (cartItems[itemId] > 1) {
      removeFromCart(itemId);
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find(
          (product) => product.id === String(item)
        );
        if (itemInfo) {
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  const contextValue = {
    all_product,
    cartItems, 
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    getTotalCartAmount,
    getTotalCartItems,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
