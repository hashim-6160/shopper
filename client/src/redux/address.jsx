import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Base API URL
const API_URL = 'http://localhost:4000/';

export const addAddressAsync = createAsyncThunk(
    'address/addAddressAsync',
    async ({ formData }, { rejectWithValue }) => {
      try {
        const response = await fetch(`${API_URL}addaddresses`, {
          method: 'POST', 
          headers:  {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // Send formData directly
        });
        
        if (!response.ok) {
          throw new Error('Failed to add address');
        }
  
        const data = await response.json();
        return data; // Return new address
      } catch (error) {
        return rejectWithValue(error.message || 'Something went wrong');
      }
    }
  );
  
// Thunk for updating an address
export const updateAddressAsync = createAsyncThunk(
  'address/updateAddressAsync',
  async ({ addressId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}updateaddress/${addressId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      return { addressId, updatedData }; // Return updated address data
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Thunk for deleting an address
export const deleteAddressAsync = createAsyncThunk(
  'address/deleteAddressAsync',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}deleteaddress/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      return addressId; // Return deleted address ID
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Thunk for getting all addresses
export const getAddressAsync = createAsyncThunk(
  'address/getAddressAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}getaddresses`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            Accept: "application/json",
            "user-info": `${localStorage.getItem("user-info")}`,
            "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      return data; // Return list of addresses
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [], // Store list of addresses
    status: 'idle', // 'loading', 'succeeded', 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get addresses
      .addCase(getAddressAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAddressAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.addresses = action.payload; // Update state with fetched addresses
      })
      .addCase(getAddressAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Add new address
      .addCase(addAddressAsync.fulfilled, (state, action) => {
        state.addresses.push(action.payload); // Add new address to the list
      })
      .addCase(addAddressAsync.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update address
      .addCase(updateAddressAsync.fulfilled, (state, action) => {
        const { addressId, updatedData } = action.payload;
        const existingAddress = state.addresses.find((addr) => addr._id === addressId);
        if (existingAddress) {
          Object.assign(existingAddress, updatedData); // Update the existing address with new data
        }
      })
      .addCase(updateAddressAsync.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete address
      .addCase(deleteAddressAsync.fulfilled, (state, action) => {
        const addressId = action.payload;
        state.addresses = state.addresses.filter((addr) => addr._id !== addressId); // Remove the deleted address from state
      })
      .addCase(deleteAddressAsync.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default addressSlice.reducer;
