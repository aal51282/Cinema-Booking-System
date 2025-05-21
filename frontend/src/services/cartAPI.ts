import { Cart, CartItem } from '../util/types';
import { api } from './baseAPI';

export const salesTaxRate = 0.07;
export const bookingFee = 3.00;
export const CART_STORAGE_KEY = 'cinema_cart';

// Initialize an empty cart
export const initializeCart = (userId: number): Cart => ({
    userId,
    items: [],
    saleTax: 0,
    subtotal: 0,
    totalPrice: 0
});

// Calculate cart totals
export const calculateCartTotals = (items: CartItem[]): { subtotal: number; saleTax: number; totalPrice: number } => {
    const subtotal = items.reduce((sum, item) => sum + item.ticket.price, 0);
    const saleTax = subtotal * salesTaxRate;
    const totalPrice = subtotal + saleTax + bookingFee;

    return {
        subtotal,
        saleTax,
        totalPrice
    };
};

export const getTicketTypes = async () => {
    console.log("test")
    const response = await api.get('api/tickets/');
    console.log(response.data)
    return response.data;
}

// Calculate cart totals via API
export const calculateCartTotalsAPI = async (cart: Cart) => {
    
    const response = await api.post('/api/cart/calculate', cart);
    return response.data;
};

// Checkout function
export const checkout = async (cart: Cart, cardId: number) => {
    try {
        const response = await api.post('/api/bookings', { cart, cardId });
        return response.data; // Return booking details
    } catch (error) {
        console.error('Error during checkout:', error);
        throw error; // Rethrow the error for handling in the calling function
    }
};

// Apply promotion code
export const applyPromoCode = async (userId: number, promoCode: string) => {
    try {
        const response = await api.post('/api/cart/apply-promotion', { userId, promoCode });
        return response.data;
    } catch (error) {
        console.error('Error applying promotion code:', error);
        throw error;
    }
};