// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import CartSlice from "../redux/cart"
import addressSlice from '../redux/address'

const store = configureStore({
  reducer: {
    cart: CartSlice, 
    address:addressSlice,
  },
});

export default store;
