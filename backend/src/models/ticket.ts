export interface Ticket {
    ticketId: number;
    bookingId: number;
    showId: number;
    ticketType: 'Adult' | 'Child' | 'Senior';
    price: number;
    seatNumber: string;  // Like 'A1', 'B1', etc.
} 