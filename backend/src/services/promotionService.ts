import Database from 'better-sqlite3';
import { Promotion } from '../models/promotion';

const db = new Database('./database/cinema.db');

export const getPromotionByCode = (promotionCode: string): Promotion | null => {
    try {
        const promotion = db.prepare(`
            SELECT 
                promotionId,
                title,
                description,
                discountPercentage
            FROM promotions 
            WHERE description = ?
        `).get(promotionCode) as Promotion | null;
        
        return promotion;
    } catch (error) {
        console.error('Error getting promotion by code(description):', error);
        throw error;
    }
}; 