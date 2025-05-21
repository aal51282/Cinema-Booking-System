import { Request, Response } from 'express';
import { sendPromotionEmail } from '../services/emailService';
import Database from 'better-sqlite3';
import { Promotion } from '../models/promotion';
import { User } from '../models/user';

const db = new Database('./database/cinema.db');

export const addPromotion = (promotion: Promotion): number => {
    try {
        const stmt = db.prepare(`
            INSERT INTO Promotions (
                title, description, discountPercentage, isSent, sendTime
            ) VALUES (
                $title, $description, $discountPercentage, $isSent, $sendTime
            )
        `);

        const result = stmt.run({
            title: promotion.title,
            description: promotion.description,
            discountPercentage: promotion.discountPercentage,
            isSent: 0,
            sendTime: promotion.sendTime || '10:00:00' // Default to 10 AM
        });

        return result.lastInsertRowid as number;
    } catch (error) {
        console.error('Error adding promotion:', error);
        throw new Error('Could not add promotion');
    }
};

export const getSubscribedUsers = (): User[] => {
    try {
        const stmt = db.prepare('SELECT * FROM Users WHERE isPromoted = 1');
        return stmt.all() as User[];
    } catch (error) {
        console.error('Error fetching subscribed users:', error);
        throw new Error('Could not retrieve subscribed users');
    }
};

export const markPromotionAsSent = (promotionId: number): void => {
    try {
        const stmt = db.prepare('UPDATE Promotions SET isSent = 1 WHERE promotionId = ?');
        stmt.run(promotionId);
    } catch (error) {
        console.error('Error marking promotion as sent:', error);
        throw new Error('Could not update promotion status');
    }
};

export const getAllPromotions = (): Promotion[] => {
    try {
        const stmt = db.prepare('SELECT * FROM Promotions');
        return stmt.all() as Promotion[];
    } catch (error) {
        console.error('Error fetching promotions:', error);
        throw new Error('Could not retrieve promotions');
    }
};

export const deletePromotion = (promotionId: number): void => {
    try {
        const stmt = db.prepare('DELETE FROM Promotions WHERE promotionId = ?');
        stmt.run(promotionId);
    } catch (error) {
        console.error('Error deleting promotion:', error);
        throw new Error('Could not delete promotion');
    }
};


// Function to validate promotion data
const validatePromotionData = (data: any) => {
    const requiredFields = ['title', 'description', 'discountPercentage'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        return `Missing required fields: ${missingFields.join(', ')}`;
    }

    if (data.discountPercentage < 0 || data.discountPercentage > 100) {
        return 'Discount percentage must be between 0 and 100';
    }

    return null;
};

// Create promotion with confirmation step
export const createPromotion = async (req: Request, res: Response) => {
    console.log("Attempting to create a promotion");
    try {
        const promotionData = req.body;
        console.log(promotionData)
        // Validate the promotion data
        const validationError = validatePromotionData(promotionData);
        if (validationError) {
            console.log("Validation Error", validationError)
            return res.status(400).json({ error: validationError });
        }

        // First, return the data for confirmation
        if (!promotionData.confirmed) {
            return res.status(200).json({
                message: 'Please confirm the promotion details',
                data: promotionData
            });
        }

        // If confirmed, add the promotion
        const promotionId = addPromotion({
            ...promotionData,
            isSent: false,
            sendTime: promotionData.sendTime || '10:00:00'
        });

        res.status(201).json({ 
            message: 'Promotion created successfully', 
            promotionId 
        });
    } catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({ error: 'Failed to create promotion' });
    }
};

// Schedule and send promotions
export const schedulePromotionSending = async () => {
    try {
        const promotions = getAllPromotions();
        const now = new Date();

        for (const promotion of promotions) {
            if (!promotion.isSent) {
                const sendTime = promotion.sendTime || '10:00:00';
                const [hours, minutes] = sendTime.split(':').map(Number);
                const today = new Date();
                today.setHours(hours, minutes, 0);

                // Check if it's time to send the promotion
                if (today <= now) {
                    const subscribedUsers = getSubscribedUsers();
                    
                    // Send emails to all subscribed users
                    for (const user of subscribedUsers) {
                        await sendPromotionEmail(user.email, promotion);
                    }

                    // Mark promotion as sent
                    markPromotionAsSent(promotion.promotionId);
                }
            }
        }
    } catch (error) {
        console.error('Error in promotion scheduling:', error);
    }
};

// Get all promotions
export const getPromotions = async (req: Request, res: Response) => {
    try {
        const promotions = getAllPromotions();
        res.status(200).json(promotions);
    } catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({ error: 'Failed to fetch promotions' });
    }
};

export const getPromotionsInternal = async () => {
    return await getAllPromotions(); 
};
// Delete promotion
export const removePromotion = async (req: Request, res: Response) => {
    try {
        const promotionId = parseInt(req.params.id);
        
        // Get the promotion to check if it exists and if it's already sent
        const promotions = getAllPromotions();
        const promotion = promotions.find(p => p.promotionId === promotionId);

        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        // Don't allow deletion of sent promotions
        if (promotion.isSent) {
            return res.status(400).json({ 
                error: 'Cannot delete a promotion that has already been sent' 
            });
        }

        await deletePromotion(promotionId);

        res.status(200).json({ 
            message: 'Promotion deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        res.status(500).json({ error: 'Failed to delete promotion' });
    }
};

// Check if user has already used this promotion code
export const hasUserUsedPromotion = (userId: number, promoCode: string): boolean => {
    try {
        console.log(`Checking if user ${userId} has used promo code: ${promoCode}`);
        
        // Verify the table exists
        const tableCheck = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='usedPromotions'
        `).get();
        
        console.log('Table check result:', tableCheck);

        // If table doesn't exist, create it
        if (!tableCheck) {
            console.log('Creating usedPromotions table...');
            db.prepare(`
                CREATE TABLE IF NOT EXISTS usedPromotions (
                    userId INTEGER,
                    promoCode TEXT,
                    usedDate INTEGER,
                    PRIMARY KEY (userId, promoCode)
                )
            `).run();
        }

        const stmt = db.prepare(`
            SELECT COUNT(*) as count 
            FROM usedPromotions 
            WHERE userId = ? AND promoCode = ?
        `);
        
        console.log('Executing query with params:', { userId, promoCode });
        const result = stmt.get(userId, promoCode) as { count: number };
        console.log(`User ${userId} has used promo code ${promoCode}: ${result.count > 0}`);
        return result.count > 0;
    } catch (error) {
        console.error('Detailed error checking used promotion:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        throw new Error(`Could not check promotion usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Record that a user has used a promotion code
export const recordPromotionUsage = (userId: number, promoCode: string): void => {
    try {
        console.log(`Recording usage of promo code ${promoCode} for user ${userId}`);
        const stmt = db.prepare(`
            INSERT INTO usedPromotions (userId, promoCode, usedDate)
            VALUES (?, ?, ?)
        `);
        
        const currentTime = Math.floor(Date.now() / 1000);
        console.log('Inserting with values:', { userId, promoCode, currentTime });
        
        const result = stmt.run(userId, promoCode, currentTime);
        console.log('Insert result:', result);
        
        console.log(`Successfully recorded usage of promo code ${promoCode} for user ${userId}`);
    } catch (error) {
        console.error('Detailed error recording promotion usage:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        throw new Error(`Could not record promotion usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};