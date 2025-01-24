// src/redux/slices/productSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("api/v1/projects", data, {
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
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("api/v1/projects");

      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (projectId, { rejectWithValue }) => {
    try {
      await api.delete(`api/v1/projects/${projectId}`, {
        withCredentials: true,
      });
      return projectId; // Return the deleted brand ID
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete brand"
      );
    }
  }
);
const projectSlice = createSlice({
  name: "projects",
  initialState: {
    items: [],
    item: {},
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null, // Error messages
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch brands

      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create brand
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.push(action.payload); // Add new brand to the list
      })

      // Delete brand
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (project) => project._id !== action.payload
        );
      });
  },
});

export default projectSlice.reducer;
