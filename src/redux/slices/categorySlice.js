// src/redux/slices/productSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("api/v1/categories", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }); // API call to create a brand
      return response.data.metadata; // Assuming the backend returns the newly created brand
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create brand"
      );
    }
  }
);
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("api/v1/categories");
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (brandId, { rejectWithValue }) => {
    try {
      await api.delete(`api/v1/categories/${brandId}`, {
        withCredentials: true,
      });
      return brandId; // Return the deleted brand ID
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete brand"
      );
    }
  }
);
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null, // Error messages
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch brands

      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create brand
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload); // Add new brand to the list
      })

      // Delete brand
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (category) => category._id !== action.payload
        );
      });
  },
});

export default categorySlice.reducer;
