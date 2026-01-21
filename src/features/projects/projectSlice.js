import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import projectService from "../../services/projectService";

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async () => {
    try {
      const response = await projectService.getAllProjects();
      console.log("response of projects", response);
      return response.data;
    } catch (error) {
      console.error("Error in fetchProjects thunk:", error);
      throw error;
    }
  },
);

export const addProjectDetails = createAsyncThunk(
  "projects/addProjectDetails",
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await projectService.addProject(projectData);
      console.log("response of add project", response);
      return response.data;
    } catch (error) {
      console.error("Error in addProjectDetails thunk:", error);
      toast.error("Failed to add project");
      return rejectWithValue(error.response.data);
    }
  },
);

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addProjectDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProjectDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addProjectDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default projectSlice.reducer;
