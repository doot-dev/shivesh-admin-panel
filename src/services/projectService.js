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
  updateProject: async (projectId, projectData) => {
    try {
      const response = await api.put(
        `/api/v1/admin/project/${projectId}`,
        projectData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },
};

export default projectService;
