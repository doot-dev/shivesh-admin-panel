import { deleteProject } from "../features/projects/projectSlice";
import api from "./api";

const projectService = {
  getAllProjects: async () => {
    try {
      const response = await api.get("/api/v1/admin/project/list");
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },
  addProject: async (projectData) => {
    try {
      const response = await api.post(
        "/api/v1/admin/project/create",
        projectData,
      );
      return response.data;
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  },
  getProjectById: async (projectId) => {
    try {
      console.log("Fetching project details for ID:", projectId);
      const response = await api.get(`/api/v1/admin/project/${projectId}`);
      console.log("Project details response:", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching project details:", error);
      throw error;
    }
  },
  updateProject: async (projectData) => {
    try {
      console.log("Updating project with data:", projectData);
      const response = await api.put(`/api/v1/admin/project`, projectData);
      return response.data;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },
  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/api/v1/admin/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },
  updateProjectCredit: async (creditData) => {
    try {
      const response = await api.put(
        `/api/v1/admin/project/credit`,
        creditData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating project credit:", error);
      throw error;
    }
  },
  updateProjectCommission: async (commissionData) => {
    try {
      const response = await api.put(
        `/api/v1/admin/project/commission`,
        commissionData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating project commission:", error);
      throw error;
    }
  },
};

export default projectService;
