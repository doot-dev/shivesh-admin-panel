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

export const fetchProjectById = createAsyncThunk(
  "projects/fetchProjectById",
  async (projectId, { rejectWithValue }) => {
    try {
      console.log("Fetching project with ID:", projectId);
      const response = await projectService.getProjectById(projectId);
      console.log("response of project by id", response);
      return response.data;
    } catch (error) {
      console.error("Error in fetchProjectById thunk:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ id, ...projectData }, { rejectWithValue }) => {
    try {
      const response = await projectService.updateProject(id, projectData);
      console.log("response of update project", response);
      return response.data;
    } catch (error) {
      console.error("Error in updateProject thunk:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    list: [],
    currentProject: null,
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
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
        // Update the project in the list as well
        const index = state.list.findIndex(
          (p) => p.id === action.payload.id || p._id === action.payload._id,
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default projectSlice.reducer;
