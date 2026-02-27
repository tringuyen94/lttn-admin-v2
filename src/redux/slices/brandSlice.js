// src/redux/slices/brandSlice.js


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const createBrand = createAsyncThunk(
  "brands/createBrand",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("api/v1/brands", data, {
        withCredentials: true,
      });
      return response.data.metadata;
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
      return brandId;
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
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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

      .addCase(createBrand.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (brand) => brand._id !== action.payload
        );
      });
  },
});

export default brandSlice.reducer;
