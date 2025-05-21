import axios from "axios";
import { api } from "./baseAPI";
import { AccountStatus } from "@/util/types";

export const getUsers = async () => {
    try {
        const response = await api.get('/api/users');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return [];
        }
        // Log other errors
        console.error('Error fetching users:', error);
        throw error;
    }
    
}

export const updateUserAccountStatus = async (userId: number, accountStatus: AccountStatus) => {
    try {
        const response = await api.put(`/api/users/${userId}/status`, { accountStatus });
        return response.data;
    } catch (error) {
        // Log errors
        console.error('Error updating user account status:', error);
        throw error;
    }
}

export const updateUserAdminStatus = async (userId: number, isAdmin: boolean) => {
    try {
        const response = await api.put(`/api/users/${userId}/AdminStatus`, { isAdmin });
        return response.data;
    } catch (error) {
        // Log errors
        console.error('Error updating user admin status:', error);
        throw error;
    }
}