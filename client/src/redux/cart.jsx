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
        body: "",
      });
      const data = await response.json(); // Parse JSON response
      console.log("Fetched cart data",data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response || "Error fetching cart data");
    }
  }
);

// Thunk for adding an item to the cart
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (itemId, { rejectWithValue }) => {
    try {
      console.log("Adding to cart:", itemId);
      const response = await fetch("http://localhost:4000/addtocart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        throw new Error("Error adding to cart");
      }

      const data = await response.json(); // Parse JSON response
      return data.cart; // Return cart data
    } catch (error) {
      return rejectWithValue(error.message || "Error adding to cart");
    }
  }
);

// Increment item quantity
export const incrementQuantity = createAsyncThunk(
  "cart/incrementQuantity",
  async (productId, { dispatch, getState }) => {
    const state = getState().cart.cart;
    const product = state?.products?.find(item => item.productId._id === productId);

    if (product) {
      const newQuantity = product.quantity + 1;
      dispatch(addQuantity({ product_id: productId, quantity: newQuantity }));

      await fetch(`http://localhost:4000/increment/${productId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      return {product_id: productId, quantity: newQuantity}
    }
  }
);

// Decrement item quantity
export const decrementQuantity = createAsyncThunk(
  "cart/decrementQuantity",
  async (productId, { dispatch, getState }) => {
    const state = getState().cart.cart;
    const product = state?.products?.find(item => item.productId._id === productId);

    if (product && product.quantity > 1) {
      const newQuantity = product.quantity - 1;
      dispatch(addQuantity({ product_id: productId, quantity: newQuantity }));

      await fetch(`http://localhost:4000/decrement/${productId}`, {
        method: "PUT",
        headers:  {
          Accept: "application/json",
          "user-info": `${localStorage.getItem("user-info")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      return {product_id: productId, quantity: newQuantity};
    } else {
      dispatch(deleteCartAsync(productId));
    }
  }
);

// Thunk for deleting an item from the cart
export const deleteCartAsync = createAsyncThunk(
  'cart/deleteCartAsync',
  async (product_id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:4000/deletecart/${product_id}`, {
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
      
      return product_id; // Return product_id to remove from state
      
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error deleting from cart');
    }

  }
);

// Cart Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: { products: [] },
    status: 'idle', // 'loading', 'succeeded', 'failed'
    error: null,
    totalItems: 0,  // New state to track the total number of items
  },
  reducers: {
    clearCart: (state) => {
      state.cart.products = []; // Clear the cart's products
      state.totalItems = 0; // Reset total items
    },
    // Reducer for updating the quantity of a product in the cart
    addQuantity: (state, action) => {
      const { product_id, quantity } = action.payload;
      const product = state.cart?.products?.find(product => product.productId._id === product_id);
      if (product) {
        product.quantity = quantity; // Update quantity in state
      }
      state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0); // Update total items
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Cart
      .addCase(getCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCartAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cart = action.payload;
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0); // Update total items
      })
      .addCase(getCartAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0); // Update total items
      })
      // Increment Quantity
      .addCase(incrementQuantity.fulfilled, (state, action) => {
        const { product_id, quantity } = action.payload;
        const product = state.cart?.products?.find(product => product.productId._id === product_id);
        if (product) {
          product.quantity = quantity; // Update quantity in state
        }
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0); // Update total items
      })
      .addCase(incrementQuantity.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Decrement Quantity
      .addCase(decrementQuantity.fulfilled, (state, action) => {
        const { product_id, quantity } = action.payload;
        const product = state.cart?.products?.find(product => product.productId._id === product_id);
        if (product) {
          product.quantity = quantity; // Update quantity in state
        }
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0); // Update total items
      })
      .addCase(decrementQuantity.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete Cart Item
      .addCase(deleteCartAsync.fulfilled, (state, action) => { 
        const productId = action.payload;
        state.cart.products = state.cart.products.filter(product => product.productId._id !== productId); // Remove deleted item from state
        state.totalItems = state.cart?.products?.reduce((total, product) => total + product.quantity, 0); // Update total items
      })
      .addCase(deleteCartAsync.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export the reducer and thunks
export const { addQuantity} = cartSlice.actions; // Export addQuantity action
export const { clearCart } = cartSlice.actions; // Export the clearCart action
export const selectTotalItems = (state) => state.cart.totalItems;
export default cartSlice.reducer;
