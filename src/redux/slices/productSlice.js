// src/redux/slices/productSlice.js


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("api/v1/products", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`api/v1/products/${productId}`);

      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("api/v1/products");

      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`api/v1/products/${productId}`, {
        withCredentials: true,
      });
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.patch(`api/v1/products/${data._id}`, data, {
        withCredentials: true,
      });
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);
export const updateImage = createAsyncThunk(
  "product/updateImage",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `api/v1/products/update-image/${payload.productId}`,
        payload.productInfo,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product image"
      );
    }
  }
);
const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    item: {},
    total: 0,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.products;
        state.total = action.payload.pagination?.total ?? action.payload.products.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchProductById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.item = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.item = action.payload;
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (product) => product._id !== action.payload
        );
      });
  },
});

export default productSlice.reducer;
