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
  async ({ ...projectData }, { rejectWithValue }) => {
    try {
      console.log("Updating project with data:", projectData);
      const response = await projectService.updateProject(projectData);
      console.log("response of update project", response);
      return response.data;
    } catch (error) {
      console.error("Error in updateProject thunk:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectService.deleteProject(projectId);
      return response.message;
    } catch (error) {
      console.error("Error in deleteProject thunk:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateProjectCredit = createAsyncThunk(
  "projects/updateProjectCredit",
  async (creditData, { rejectWithValue }) => {
    try {
      const response = await projectService.updateProjectCredit(creditData);

      return {
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const updateProjectCommission = createAsyncThunk(
  "projects/updateProjectCommission",
  async (commissionData, { rejectWithValue }) => {
    try {
      const response =
        await projectService.updateProjectCommission(commissionData);
      console.log("response of update project commission", response);
      return {
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error("Error in updateProjectCommission thunk:", error);
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
      })
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.meta.arg;
        state.list = state.list.filter(
          (p) =>
            p.projectId !== deletedId &&
            p.id !== deletedId &&
            p._id !== deletedId,
        );

        if (
          state.currentProject &&
          (state.currentProject.projectId === deletedId ||
            state.currentProject.id === deletedId ||
            state.currentProject._id === deletedId)
        ) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateProjectCredit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectCredit.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentProject) {
          state.currentProject = {
            ...state.currentProject,
            ...action.payload.data,
          };
        }
      })
      .addCase(updateProjectCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateProjectCommission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectCommission.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentProject) {
          state.currentProject = {
            ...state.currentProject,
            ...action.payload.data,
          };
        }
      })
      .addCase(updateProjectCommission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default projectSlice.reducer;
