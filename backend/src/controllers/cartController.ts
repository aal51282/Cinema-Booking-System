import { Request, Response } from 'express';
import { Cart, SALES_TAX_RATE } from '../models/cart';
import { getShowTicketPrice } from '../services/ticketService';
import { getPromotionByCode } from '../services/promotionService';
import { hasUserUsedPromotion, recordPromotionUsage } from './promotionController';

const CART_SALES_TAX_RATE = SALES_TAX_RATE; // 7% tax rate imported from cart.ts
const ONLINE_FEE = 3.00;

export const calculateCart = (req: Request, res: Response) => {
    try {
        const cart: Cart = req.body;
        
        // Validate required fields
        if (!cart.items || cart.items.length === 0) {
            return res.json({ 
                items: [],
                quantity: 0,
                promotion: null,
                subtotal: 0.0,
                saleTax: 0.0,
                totalPrice: 0.0
            });
        }

        // Calculate subtotal
        let subtotal = 0;
        for (const item of cart.items) {
            // Validate price based on show and ticket type
            const dbPrice = getShowTicketPrice(item.ticket.ticketType);
            
            if (dbPrice === null) {
                return res.status(404).json({ 
                    message: `Price not found for show ID: ${item.ticket.showId} and type: ${item.ticket.ticketType}` 
                });
            }

            // Validate price matches database price
            if (item.ticket.price !== dbPrice) {
                return res.status(400).json({ 
                    message: `Invalid price for show ID: ${item.ticket.showId}` 
                });
            }

            subtotal += item.ticket.price;
        }

        // Calculate amounts
        let discountAmount = 0;
        let finalTotal = subtotal;

        // Apply promotion if exists
        if (cart.promotion?.description) {
            const promotion = getPromotionByCode(cart.promotion.description);
            
            if (!promotion) {
                return res.status(400).json({ 
                    message: 'Invalid promotion code' 
                });
            }
            
            discountAmount = (promotion.discountPercentage / 100) * subtotal;
            finalTotal = subtotal - discountAmount;
        }

        // Calculate tax on the discounted amount
        const saleTax = finalTotal * CART_SALES_TAX_RATE;
        
        // Calculate final total with tax
        const totalPrice = finalTotal + saleTax + ONLINE_FEE;

        // Return calculated values with quantity derived from items length
        res.json({
            items: cart.items,
            quantity: cart.items.length,
            promotion: cart.promotion,
            subtotal,
            saleTax,
            totalPrice: totalPrice
        });

    } catch (error) {
        console.error('Error calculating cart:', error);
        res.status(500).json({ 
            message: 'Error calculating cart',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 

export const totalCart = (cart: Cart) => {
    try {
        // Validate required fields
        if (!cart.items || cart.items.length === 0) {
            return { 
                items: [],
                quantity: 0,
                promotion: null,
                subtotal: 0.0,
                saleTax: 0.0,
                totalPrice: 0.0
            };
        }

        // Calculate subtotal
        let subtotal = 0;
        for (const item of cart.items) {
            // Validate price based on show and ticket type
            const dbPrice = getShowTicketPrice(item.ticket.ticketType);
            
            if (dbPrice === null) {
                throw new Error( `Price not found for show ID: ${item.ticket.showId} and type: ${item.ticket.ticketType}` );
            }

            // Validate price matches database price
            if (item.ticket.price !== dbPrice) {
                throw new Error( `Invalid price for show ID: ${item.ticket.showId}` );
            }

            subtotal += item.ticket.price;
        }

        // Calculate amounts
        let discountAmount = 0;
        let finalTotal = subtotal;

        // Apply promotion if exists
        if (cart.promotion?.description) {
            const promotion = getPromotionByCode(cart.promotion.description);
            
            if (!promotion) {
                throw new Error( 'Invalid promotion code' );
            }
            
            discountAmount = (promotion.discountPercentage / 100) * subtotal;
            finalTotal = subtotal - discountAmount;
        }

        // Calculate tax on the discounted amount
        const saleTax = finalTotal * CART_SALES_TAX_RATE;
        
        // Calculate final total with tax
        const totalPrice = finalTotal + saleTax + ONLINE_FEE;

        // Return calculated values with quantity derived from items length
        return {
            items: cart.items,
            quantity: cart.items.length,
            promotion: cart.promotion,
            subtotal,
            saleTax,
            totalPrice: totalPrice
        };

    } catch (error) {
        console.error('Error calculating cart:', error);
       throw new Error('Error calculating cart');
    }
}; 

export const applyPromoCode = async (req: Request, res: Response) => {
    try {
        const { userId, promoCode } = req.body;
        console.log('Attempting to apply promo code:', { userId, promoCode });

        if (!userId || !promoCode) {
            return res.status(400).json({ 
                message: 'Please provide a valid promotion code' 
            });
        }

        const promotion = getPromotionByCode(promoCode);
        console.log('Found promotion:', promotion);
        
        if (!promotion) {
            return res.status(400).json({ 
                message: 'This promotion code is not valid or has expired. Please check and try again.' 
            });
        }

        // Check if user has already used this promotion code
        const hasUsed = hasUserUsedPromotion(userId, promoCode);
        console.log('Has user used promotion:', hasUsed);

        if (hasUsed) {
            return res.status(400).json({ 
                message: 'You have already used this promotion code' 
            });
        }

        // Record the promotion usage BEFORE sending success response
        try {
            recordPromotionUsage(userId, promoCode);
            console.log('Successfully recorded promotion usage');
        } catch (error) {
            console.error('Failed to record promotion usage:', error);
            return res.status(500).json({ 
                message: 'Error recording promotion usage' 
            });
        }

        // Return the promotion details
        res.json({ 
            message: 'Promotion applied successfully',
            promotion: {
                description: promotion.description,
                discountPercentage: promotion.discountPercentage
            }
        });

    } catch (error) {
        console.error('Error applying promotion code:', error);
        res.status(500).json({ 
            message: 'We encountered an issue while applying your promotion code. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 