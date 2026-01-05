import api from "./api";

const projectService = {
    getAllProjects: async () => {
        try {
            const response = await api.get('/api/v1/admin/project/list');
            return response.data;
        }catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    }
};

export default projectService;