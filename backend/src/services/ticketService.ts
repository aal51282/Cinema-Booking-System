import Database from 'better-sqlite3';

const db = new Database('./database/cinema.db');

export const getTicketPrice = (ticketId: number): number | null => { //get price based on ticketId
    try {
        const result = db.prepare(`
            SELECT price
            FROM tickets 
            WHERE ticketId = ?
        `).get(ticketId) as { price: number } | undefined;
        
        return result?.price ?? null;
    } catch (error) {
        console.error('Error getting ticket price:', error);
        throw error;
    }
};

export const getTickets = (): Array<{ ticketType: string; price: number }> => {
    try {
        console.log(`retrieving ticket types from db`)
        const result = db.prepare(`
            SELECT ticketType, price
            FROM TicketTypePrices
        `).all() as Array<{ ticketType: string; price: number }>;
        console.log(`retrieved ticket types successfully, returning`)
        return result;
    } catch (error) {
        console.error('Error getting ticket types:', error);
        throw error;
    }
};


export const updateTicketPrice = (ticketId: number, price: number): boolean => {
    try {
        const result = db.prepare(`
            UPDATE tickets
            SET price = ?
            WHERE ticketId = ?
        `).run(price, ticketId);
        
        return result.changes > 0;
    } catch (error) {
        console.error('Error updating ticket price:', error);
        throw error;
    }
};

export const getShowTicketPrice = (ticketType: string): number | null => { //get price based on ticket type
    try {
        const result = db.prepare(`
            SELECT price
            FROM TicketTypePrices 
            WHERE ticketType = ?
        `).get(ticketType) as { price: number } | undefined;
        
        return result?.price ?? null;
    } catch (error) {
        console.error('Error getting ticket price:', error);
        throw error;
    }
};