// src/redux/slices/productSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const createBrand = createAsyncThunk(
  "brands/createBrand",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("api/v1/brands", data, {
        withCredentials: true,
      }); // API call to create a brand
      return response.data.metadata; // Assuming the backend returns the newly created brand
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create brand"
      );
    }
  }
);
export const fetchBrands = createAsyncThunk(
  "brands/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("api/v1/brands");

      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "brands/deleteBrand",
  async (brandId, { rejectWithValue }) => {
    try {
      await api.delete(`api/v1/brands/${brandId}`, { withCredentials: true });
      return brandId; // Return the deleted brand ID
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete brand"
      );
    }
  }
);
const brandSlice = createSlice({
  name: "brands",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null, // Error messages
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch brands

      .addCase(fetchBrands.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create brand
      .addCase(createBrand.fulfilled, (state, action) => {
        state.items.push(action.payload); // Add new brand to the list
      })

      // Delete brand
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (brand) => brand._id !== action.payload
        );
      });
  },
});

export default brandSlice.reducer;
