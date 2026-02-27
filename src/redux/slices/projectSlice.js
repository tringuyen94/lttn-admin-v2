// src/redux/slices/projectSlice.js


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("api/v1/projects", data, {
        withCredentials: true,
      });
      return response.data.metadata;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create project"
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
        error.response?.data?.message || "Failed to fetch projects"
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
      return projectId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete project"
      );
    }
  }
);
const projectSlice = createSlice({
  name: "projects",
  initialState: {
    items: [],
    item: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.projects;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(createProject.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (project) => project._id !== action.payload
        );
      });
  },
});

export default projectSlice.reducer;
