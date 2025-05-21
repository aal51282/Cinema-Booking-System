
export interface ShowSeat {
    seatId: number;
    showId: number;
    seatNumber: string;
    bookingId: number;
}
export interface Booking {
    bookingId?: number; // Optional for new bookings
    userId: number;
    cardFour: string;
    bookingDate: number; // UNIX timestamp
    totalAmount: number;
    paymentStatus: 'Paid' | 'Pending' | 'Canceled';
    tickets?: ShowSeat[]; // Optional, for returning booking with tickets
}