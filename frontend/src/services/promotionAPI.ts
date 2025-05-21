import { api } from './baseAPI';
import { Promotion } from '@/util/types';
import axios from 'axios';

export const getPromotions = async () => {
    try {
        const response = await api.get('/api/promotions');
        return response.data;
    } catch (error) {
        alert('Unable to fetch promotions. Please try again later.');
        console.error('Error fetching promotions:', error);
        return [];
    }
};

export const createPromotion = async (promotionData: Partial<Promotion>) => {
    try {
        // First call to get confirmation
        const confirmResponse = await api.post('/api/promotions', promotionData);
        
        // If we got the data back for confirmation, make the final call
        if (confirmResponse.data.message === 'Please confirm the promotion details') {
            const finalResponse = await api.post('/api/promotions', {
                ...promotionData,
                confirmed: true
            });
            return finalResponse.data;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Unable to create promotion. Please try again later.');
            }
        } else {
            alert('An unexpected error occurred while creating the promotion.');
        }
        throw error;
    }
};

export const deletePromotion = async (promotionId: number) => {
    try {
        await api.delete(`/api/promotions/${promotionId}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 400) {
                alert('Cannot delete a promotion that has already been sent.');
            } else {
                alert('Unable to delete promotion. Please try again later.');
            }
        } else {
            alert('An unexpected error occurred while deleting the promotion.');
        }
        throw error;
    }
}; 