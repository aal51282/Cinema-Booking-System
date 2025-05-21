export interface Movie {
    id: number; // Optional for new movies
    title: string;
    category: string;
    //status: string; should be deleted from db as well 
    cast: string[]; // JSON string
    director: string;
    producer: string;
    movie_poster: string; 
    synopsis: string;
    reviews: {reviewer: string; comment: string; rating: number}[];
    trailer: { picture: string; video: string[] }; // JSON string
    mpaa_rating: string;
    duration: number;
    soonestShow?: number | null;
    shows?: Show[];
}

export interface Room { 
    roomId: number; 
    roomName: string 
}

export interface Show {
    showId?: number;
    roomId: number;
    showDate: number;
    startTime: number;
}

export interface Review {
    reviewer: string;
    comment: string;
    rating: number;
}

export interface Trailer {
    picture: string;
    video: string[];
}

export interface ShowDate {
    date: string;
    times: string[];
}

export interface Order {
    invoice: string;
    movieId: number;
    dateOrdered: Date;
    dateShowing: Date;
    totalAmount: number;
    paymentMethod: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    user: User | null;
    updateUser: (updatedUser: User) => void;
}

export enum AccountStatus {
    Active = 'Active',
    Inactive = 'Inactive'
}

export interface User {
    userId: number;
    email: string;
    phone_number?: string;
    firstName: string;
    lastName: string;
    password?: string;
    cards?: CardInformation[];
    accountStatus: AccountStatus;
    isPromoted?: boolean;
    billingAddress?: Address | string;
    isAdmin?: boolean;
}

export interface Address {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export interface CardInformation {
    card_id: number | null;
    cardType: 'Visa' | 'MasterCard' | 'Amex'; 
    cardNumber: string;
    isDefault: boolean;
    cardHolderName: string;
    expirationDate: string;
    billingAddress?: string | null;
    cvv: string;
};

export interface Purchase {
    purchaseId: string;
    movieId: number;
    showTime: Date;
    totalAmount: number;
    seats: string[];
}

export interface MovieFilter {
    title?: string;
    category?: string;
    showDate?: string;
    limit?: number;
    offset?: number;
}

export interface Promotion {
    promotionId: number;
    title: string;
    description: string;
    discountPercentage: number;
    sendTime?: string;
    isSent: boolean;
}

export interface TicketType {
    ticketType: string;
    price: number;
}

export interface CartTicket {
    showId: number;
    ticketType: string;
    price: number;
    seatNumber: string;  // Like 'A1', 'B1', etc.
}

export interface CartItem {
    ticket: CartTicket;
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

export interface ShowSeat {
    seatId: number;
    showId: number;
    seatNumber: string;
    bookingId: number;
}
export interface Booking {
    bookingId?: number; // Optional for new bookings
    userId: number;
    cardId?: number;
    cardFour?: string;
    bookingDate: number; // UNIX timestamp
    totalAmount: number;
    paymentStatus: 'Paid' | 'Pending' | 'Canceled';
    tickets?: ShowSeat[]; // Optional, for returning booking with tickets
}
export interface BookingDetails {
    bookingId: number;
    cardFour: string;
    bookingDate: number;
    totalAmount: number;
    paymentStatus: string;
    ticketId: number;
    showId: number;
    ticketType: string;
    price: number;
    seatNumber: string;
    movieTitle: string;
}