import { Request, Response } from 'express';
import { getTicketPrice as getPrice, updateTicketPrice as updatePrice, getTickets } from '../services/ticketService';

export const getTicketPrice = (req: Request, res: Response) => {
    try {
        const ticketId = parseInt(req.params.ticketId);
        const price = getPrice(ticketId);

        if (price === null) {
            return res.status(404).json({ 
                message: `Ticket not found with ID: ${ticketId}` 
            });
        }

        res.json({ price });
    } catch (error) {
        console.error('Error getting ticket price:', error);
        res.status(500).json({ 
            message: 'Error getting ticket price',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTicketTypes = (req: Request, res: Response) => {
    try {
        console.log(`ticket request receieved`)
        const tickets = getTickets(); // Assuming getTickets is a function in ticketService that retrieves all ticket types
        console.log(`responding to request with tickets`)
        res.json(tickets);
    } catch (error) {
        console.error('Error getting ticket types:', error);
        res.status(500).json({ 
            message: 'Error getting ticket types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};


export const updateTicketPrice = (req: Request, res: Response) => {
    try {
        const ticketId = parseInt(req.params.ticketId);
        const { price } = req.body;

        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ 
                message: 'Invalid price value' 
            });
        }

        const success = updatePrice(ticketId, price);

        if (!success) {
            return res.status(404).json({ 
                message: `Ticket not found with ID: ${ticketId}` 
            });
        }

        res.json({ 
            message: 'Price updated successfully',
            ticketId,
            price 
        });
    } catch (error) {
        console.error('Error updating ticket price:', error);
        res.status(500).json({ 
            message: 'Error updating ticket price',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 