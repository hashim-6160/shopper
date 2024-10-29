import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk for getting the cart data
export const getCartAsync = createAsyncThunk(
  'cart/getCartAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:4000/getcart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.response || "Error fetching cart data");
    }
  }
);

// Thunk for adding an item to the cart
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async ({ itemId, size }, { rejectWithValue }) => {
    try {
      console.log(itemId,size)
      const response = await fetch("http://localhost:4000/addtocart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, size }),
      });

      if (!response.ok) {
        throw new Error("Error adding to cart");
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.message || "Error adding to cart");
    }
  }
);

// Thunk for increment quantity
export const incrementQuantity = createAsyncThunk(
  "cart/incrementQuantity",
  async ({ productId, size, stockForSize }, { getState }) => {
    const state = getState().cart;
    const product = state.cart?.products?.find(
      item => item.productId._id === productId && item.size === size
    );

    if (!product) {
      throw new Error('Product not found in cart');
    }

    const newQuantity = product.quantity + 1;

    try {
      const response = await fetch(`http://localhost:4000/increment/${productId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          quantity: newQuantity, 
          size 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to increment quantity');
      }

      return { 
        product_id: productId, 
        quantity: newQuantity, 
        size 
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to increment quantity');
    }
  }
);

// Thunk for decrement quantity
export const decrementQuantity = createAsyncThunk(
  "cart/decrementQuantity",
  async ({ productId, size }, { dispatch, getState }) => {
    const state = getState().cart;
    const product = state.cart?.products?.find(
      item => item.productId._id === productId && item.size === size
    );

    if (!product) {
      throw new Error('Product not found in cart');
    }

    if (product.quantity <= 1) {
      return dispatch(deleteCartAsync(productId));
    }

    const newQuantity = product.quantity - 1;

    try {
      const response = await fetch(`http://localhost:4000/decrement/${productId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          quantity: newQuantity, 
          size 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to decrement quantity');
      }

      return { 
        product_id: productId, 
        quantity: newQuantity, 
        size 
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to decrement quantity');
    }
  }
);

// Thunk for deleting from cart
export const deleteCartAsync = createAsyncThunk(
  "cart/deleteCartAsync",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:4000/deletecart/${productId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error deleting from cart");
      }
      console.log("delete hitted")
      return productId;
    } catch (error) {
      return rejectWithValue(error.message || "Error deleting from cart");
    }
  }
);

// Thunk for fetching wishlist data
export const fetchWishlistAsync = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:4000/getwishlist", {
        method: "GET",
        headers: {
          // Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data)
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Error fetching wishlist");
    }
  }
);

// Thunk for adding to wishlist
export const addToWishlistAsync = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ productId,size}, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:4000/addwishlist", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId ,size}),
      });
      if (response.ok) {
        console.log("Product added to wishlist:");
      }else{
        throw new Error("Error adding to wishlist");
      }

      const data = await response.json();
      console.log("Product added to wishlist:", data);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Error adding to wishlist");
    }
  }
);

// Thunk for removing an item from the wishlist
export const removeFromWishlistAsync = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({productId,size}, { rejectWithValue }) => {
    console.log(productId ,size)
    try {
      const response = await fetch(`http://localhost:4000/removewishlist`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId ,size}),
      });
      if (!response.ok) throw new Error("Failed to remove from wishlist");
      console.log("remove api hitted",productId)
      return productId;
    } catch (error) {
      return rejectWithValue(error.message || "Error removing from wishlist");
    }
  }
);

// Cart and Wishlist Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: { products: [] },
    wishlist: { products: [] },
    status: 'idle',
    error: null,
    totalItems: 0,  
  },
  reducers: {
    clearCart: (state) => {
      state.cart.products = []; 
      state.totalItems = 0; 
    },
    addQuantity: (state, action) => {
      const { product_id, quantity } = action.payload;
      const product = state.cart?.products?.find(product => product.productId._id === product_id);
      if (product) {
        product.quantity = quantity;
      }
      state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCartAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cart = action.payload;
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0);
      })
      .addCase(getCartAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0);
      })
      .addCase(incrementQuantity.fulfilled, (state, action) => {
        const { product_id, quantity, size } = action.payload;
        const product = state.cart?.products?.find(
          product => product.productId._id === product_id && product.size === size
        );
        if (product) {
          product.quantity = quantity;
        }
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0);
      })
      .addCase(incrementQuantity.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(decrementQuantity.fulfilled, (state, action) => {
        const { product_id, quantity, size } = action.payload;
        const product = state.cart?.products?.find(
          product => product.productId._id === product_id && product.size === size
        );
        if (product) {
          product.quantity = quantity;
        }
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0);
      })
      .addCase(decrementQuantity.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteCartAsync.fulfilled, (state, action) => {
        state.cart.products = state.cart.products.filter(product => product.productId._id !== action.payload);
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0);
      })
      // Wishlist cases
      .addCase(fetchWishlistAsync.fulfilled, (state, action) => {
        state.wishlist.products = action.payload;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.wishlist.products.push(action.payload);
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        console.log()
        
        state.wishlist.products = state.wishlist.filter(product => product.productId !== action.payload);
        console.log(state.wishlist.products)
      });
  },
});

export const { clearCart, addQuantity } = cartSlice.actions;
export const selectTotalItems = (state) => state.cart.totalItems;
export default cartSlice.reducer;
