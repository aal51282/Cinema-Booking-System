export const SALES_TAX_RATE = 0.07;

export interface CartTicket {
    showId: number;
    ticketType: 'Adult' | 'Child' | 'Senior';
    price: number;
    seatNumber: string;  // Like 'A1', 'B1', etc.
}

export interface CartItem {
    ticket: CartTicket;  // Using CartTicket instead of Ticket, bc they are not added to the database yet
}

export interface Cart {
    userId: number;
    items: CartItem[];
    promotion?: {
        description: string;
    };
    quantity?: number;
    saleTax: number;
    subtotal?: number;
    totalPrice?: number;
}