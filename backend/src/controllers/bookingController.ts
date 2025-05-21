import { Request, Response } from 'express';
import { getUserById } from '../controllers/userController';
import { Booking } from '../models/booking';
import { Payment } from '../models/payment';
import { sendBookingEmail } from '../services/emailService';
import { Cart } from '../models/cart';
import { getDecryptedUserPayments } from '../services/paymentService';
import { totalCart } from './cartController';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../database/cinema.db');
const db = new Database(dbPath);

// Add a new booking
export const addBooking = (
    userId: number, 
    cardFour: string, 
    bookingDate: number, 
    totalAmount: number, 
    paymentStatus: string
): number => {
    try {
        const stmt = db.prepare(`
            INSERT INTO Bookings (userId, cardFour, bookingDate, totalAmount, paymentStatus)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(userId, cardFour, bookingDate, totalAmount, paymentStatus);
        return Number(result.lastInsertRowid);
    } catch (error) {
        console.error('Error adding booking:', error);
        throw new Error('Could not add booking');
    }
};

// Add tickets to a booking
export const addTickets = (bookingId: number, tickets: Array<{showId: number, ticketType: string, price: number, seatNumber: string}>): void => {
    const insertTickets = db.prepare(`
        INSERT INTO Tickets (bookingId, showId, ticketType, price, seatNumber)
        VALUES (?, ?, ?, ?, ?)
    `);
    const insertShowSeats = db.prepare(`
        INSERT INTO ShowSeats(showId, seatNumber, bookingId)
        VALUES (?, ?, ?)
    `);

    const insertMany = db.transaction((ticketsData) => {
        for (const ticket of ticketsData) {
            try {
                console.log('Attempting to insert ticket:', {
                    bookingId,
                    showId: ticket.showId,
                    ticketType: ticket.ticketType,
                    price: ticket.price,
                    seatNumber: ticket.seatNumber
                });
                
                insertTickets.run(
                    bookingId, 
                    ticket.showId,
                    ticket.ticketType,
                    ticket.price,
                    ticket.seatNumber
                );
                console.log('Attempting to insert showSeat:', {
                    showId: ticket.showId,
                    seatNumber: ticket.seatNumber, 
                    bookingId
                });
                
                insertShowSeats.run(
                    ticket.showId,
                    ticket.seatNumber, 
                    bookingId
                );
            } catch (err) {
                console.error('Error inserting individual ticket or showSeat:', err);
                throw err;
            }
        }
    });

    try {
        insertMany(tickets);
    } catch (error) {
        console.error('Detailed error adding tickets or showSeats:', error);
        // Log the actual tickets data being inserted
        //console.error('Tickets data:', JSON.stringify(tickets, null, 2));
        throw new Error(`Could not add tickets or showSeats: ${(error as Error).message}`);
    }
};


// Get bookings for a user
export const getBookings = (userId: number): any[] => {
    try {
        const stmt = db.prepare(`
            SELECT b.bookingId, b.cardFour, b.bookingDate, b.totalAmount, b.paymentStatus,
                   t.ticketId, t.showId, t.ticketType, t.price, t.seatNumber,
                   m.title AS movieTitle, s.showDate
            FROM Bookings b
            JOIN Tickets t ON b.bookingId = t.bookingId
            JOIN Shows s ON t.showId = s.showId
            JOIN Movies m ON s.movieId = m.id
            WHERE b.userId = ?
        `);
        return stmt.all(userId);
    } catch (error) {
        console.error('Error retrieving bookings:', error);
        throw new Error('Could not retrieve bookings');
    }
};

// Add a new booking
export const createBooking = async (req: Request, res: Response) => {
    try {
        const { cart, cardId } = req.body as { 
            cart: Cart; 
            cardId: number;
        };

        if (!cart || !cardId) {
            return res.status(400).json({ error: 'Missing required fields: userId, cart, cardId' });
        }

        const updatedCart = totalCart(cart);
        // Get payment information using existing service
        const userPayments = await getDecryptedUserPayments(cart.userId);
        const paymentCard = userPayments.find(p => p.card_id === cardId);

        if (!paymentCard) {
            return res.status(404).json({ error: 'Payment card not found' });
        }

        const cardType = paymentCard.cardType;
        const cardNumber = paymentCard.cardNumber;
        const lastFour = cardNumber?.slice(-4);
        const cardFour = `${cardType}${'****'}${lastFour}`;

        // Calculate total amount
        //const totalAmount = cart.reduce((sum: number, item: CartItem) => sum + item.ticket.price, 0);
        const totalAmount = updatedCart.totalPrice; 

        // Create booking
        const bookingDate = Math.floor(Date.now() / 1000);
        const paymentStatus = 'Paid' as const;

        const bookingId = addBooking(cart.userId, cardFour, bookingDate, totalAmount, paymentStatus);
        
        // Add tickets - renamed from 'tickets' to 'ticketsToAdd'
        const ticketsToAdd = cart.items.map(item => ({
            showId: item.ticket.showId,
            ticketType: item.ticket.ticketType,
            price: item.ticket.price,
            seatNumber: item.ticket.seatNumber
        }));
        addTickets(bookingId, ticketsToAdd);

        // Get user email
        const user = await getUserById(cart.userId);
        if (!user) {
            throw new Error('User not found');
        }

        const userId = cart.userId;

        // Create booking object for email
        const booking: Booking = {
            bookingId,
            userId,
            cardFour,
            bookingDate,
            totalAmount,
            paymentStatus
        };

        // Retrieve tickets details - renamed from 'tickets' to 'bookingTickets'
        const bookingTickets = getBookings(userId).filter(b => b.bookingId === bookingId);
        console.log("Booking Tickets:", bookingTickets);
        // Send confirmation email
        await sendBookingEmail(user.email, user.firstName, booking, paymentCard, bookingTickets);

        // Respond with booking info
        res.status(201).json({
            bookingId,
            bookingDate,
            totalAmount,
            paymentStatus,
            tickets: bookingTickets // Using the renamed variable
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get bookings for a user
export const getUserBookings = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        const bookings = getBookings(parseInt(userId));

        res.status(200).json({ bookings });
    } catch (error: any) {
        console.error('Error retrieving bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
interface MovieTitleResult {
    title: string;
}
export const getMTitleByShowId = (showId: number): string | null => {
    try {
        const getTitle = db.prepare(`
            SELECT m.title
            FROM Movies m
            JOIN Shows s ON m.id = s.movieId
            WHERE s.showId = ?
        `);

        const result = getTitle.get(showId) as MovieTitleResult | undefined;
        return result ? result.title : null; 
    } catch (error) {
        console.error('Error retrieving movie title by showId:', error);
        throw new Error('Could not retreve movie title');
    }
};