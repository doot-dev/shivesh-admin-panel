import api from './api';

const clientService = {
    getClients: async () => {
        try {
            const response = await api.get("/api/v1/admin/client/list");
           
            return response.data;
        } catch (error) {
            console.error("Error fetching vendors:", error);
            throw error;
        }
    }
}

export default clientService;