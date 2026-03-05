import api from './api';

const clientService = {
    getClients: async () => {
        try {
            const response = await api.get("/api/v1/admin/client/list?length=1000");
            return response.data;
        } catch (error) {
            console.error("Error fetching clients:", error);
            throw error;
        }
    },

    getClientsById: async (clientId) => {
        try {
            const response = await api.get(`/api/v1/admin/client/${clientId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching client with ID ${clientId}:`, error);
            throw error;
        }
    },

    createClient: async (clientData) => {
        try {
            const response = await api.post("/api/v1/admin/client/create", clientData);
            return response.data;
        } catch (error) {
            console.error("Error creating client:", error);
            throw error;
        }
    },
    updateClient: async (clientData) => {
        try {
            console.log("Updating client:", clientData);
            const response = await api.put(`/api/v1/admin/client/update`, clientData);
            console.log("Update client response:", response);
            return response.data;
        } catch (error) {
            console.error("Error updating client:", error);
            throw error;
        }
    },
    
    uploadKYCDocuments: async (clientId, documents = {}) => {
        try {
            const formData = new FormData();
            console.log("Uploading KYC documents for client ID:", clientId, documents);
            formData.append("clientId", clientId);

            Object.entries(documents).forEach(([key, file]) => {
                if (file) {
                    formData.append('kycDocuments', file);
                }
            });

            const response = await api.post(
                `/api/v1/admin/client/upload-kyc`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log("KYC upload response:", response);
            return response.data;
        } catch (error) {
            console.error(`Error uploading KYC documents for client ID ${clientId}:`, error);
            throw error;
        }
    },
    deleteClient: async (clientId) =>{
        try {
            console.log("Deleting client with ID:", clientId);
            const response = await api.delete(`/api/v1/admin/client/${clientId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting client with ID ${clientId}:`, error);
            throw error;
        }
    }
};

export default clientService;