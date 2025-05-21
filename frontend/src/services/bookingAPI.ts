import { api } from './baseAPI';
import { Booking } from '../util/types';

export const getBookingByUserId = async (userId: number): Promise<Booking[]> => {
    try {
        const response = await api.get(`/api/bookings/${userId}`);
        return response.data.bookings;
    } catch (error) {
        console.error('Error fetching bookings by user ID:', error);
        throw new Error('Could not retrieve bookings. Please try again later.');
    }
}; 

export const getBooking = async (userId: number, bookingId: number): Promise<any> => {
    const bookings = await getBookingByUserId(userId);
    const booking = bookings.filter(b => b.bookingId === bookingId) as any;
    if (!booking) {
        throw new Error('Booking not found for the given user ID and booking ID.');
    }
    const formatted = {
        bookingDate: booking[0].bookingDate,
        bookingId: booking[0].bookingId,
        cardFour: booking[0].cardFour,
        movieTitle: booking[0].movieTitle,
        totalAmount: booking[0].totalAmount,
        showDate: booking[0].showDate,
        tickets: booking.map((b: any) => ({
          seatNumber: b.seatNumber,
          price: b.price,
          ticketType: b.ticketType,
          showId: b.showId
        }))
      };
    return formatted;
}

export const getUserHistory = async (userId: number): Promise<any[]> => {
    const bookings = await getBookingByUserId(userId);
    
    // Group bookings by bookingId
    const groupedBookings: { [key: number]: any } = {};
    
    bookings.forEach((b: any) => {
        if (!groupedBookings[b.bookingId]) {
            groupedBookings[b.bookingId] = {
                bookingDate: b.bookingDate,
                bookingId: b.bookingId,
                cardFour: b.cardFour,
                movieTitle: b.movieTitle,
                totalAmount: b.totalAmount,
                showDate: b.showDate,
            };
        }
    });

    // Convert the groupedBookings object to an array
    const formattedBookings = Object.values(groupedBookings);
    
    if (formattedBookings.length === 0) {
        throw new Error('No bookings found for the given user ID.');
    }

    return formattedBookings;
}