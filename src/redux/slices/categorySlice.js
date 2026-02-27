// src/redux/slices/categorySlice.js


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
      });
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
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
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      await api.delete(`api/v1/categories/${categoryId}`, {
        withCredentials: true,
      });
      return categoryId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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

      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (category) => category._id !== action.payload
        );
      });
  },
});

export default categorySlice.reducer;
