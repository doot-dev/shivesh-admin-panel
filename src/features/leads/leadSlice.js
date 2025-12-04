import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import leadService from "../../services/leadService";
import { toast } from "react-toastify";

export const fetchLeads = createAsyncThunk("leads/getallLeads", async () => {
    const response = await leadService.getAllLeads();
    return response;
})

export const createLeads = createAsyncThunk("leads/createLead", async (leadsRes, { rejectWithValue }) => {
    try {
        const res = await leadService.addNewLead(leadsRes);
        toast.success(res?.message);
        return res;
    } catch (err) {
        const message = err?.res?.message;
        toast.error(message)
        return rejectWithValue(err.response?.res || err.message)
    }
})

export const fetchLeadsById = createAsyncThunk("leads/getallLeadsById", async (leadId, { rejectWithValue }) => {
    try {
        const res = await leadService.getLeadsById(leadId);
        toast.success(res?.message);
        return res;
    } catch (err) {
        const message = err?.res?.message;
        toast.error(message)
        return rejectWithValue(err.response?.res || err.message)
    }
})

export const updateActivityLog = createAsyncThunk("leads/updateLog", async (leadId, logData, { rejectWithValue }) => {
    try {
        const res = await leadService.updateActivityLog(leadId, logData);
        toast.success(res?.message);
        return res;
    } catch (err) {
        const message = err?.res?.message;
        toast.success(message)
        return rejectWithValue(err.response?.res || err.message)
    }
})

export const removeLead = createAsyncThunk("leads/deleteLead", async (leadId, { rejectWithValue }) => {
    try {
        const res = await leadService.deleteLead(leadId);
        toast.success(res?.message);
        return res;
    } catch (err) {
        const message = err?.res?.message;
        toast.success(message)
        return rejectWithValue(err.response?.res || err.message)
    }
})