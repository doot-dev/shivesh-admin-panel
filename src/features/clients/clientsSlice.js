import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import clientService from "../../services/clientService";


export const fetchClients = createAsyncThunk("clients/getallClients", async () => {
    const response = await clientService.getClients();
    console.log("repsonse of client", response)
    return response.data;
})


const clientSlice = createSlice({
    name: "client",
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchClients.pending, (state) => {
            state.loading = true;
            state.error = null;
        }).addCase(fetchClients.fulfilled, (state, action) => {
            state.loading = false;
            state.list = action.payload;
        })

    }
})

export default clientSlice.reducer;