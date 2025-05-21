export interface Address {
    id?: number;
    userId: number;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    createdAt: string; // Store as ISO string
    updatedAt: string; // Store as ISO string
}

export interface Payment {
    card_id?: number;
    userId: number;
    cardType: 'Visa' | 'MasterCard' | 'Amex';  // Add this line
    cardHolderName:string;
    cardNumber: string; // credit card number
    expirationDate: string; // For credit card
    cvv:string; // credit card cvv
    isDefault: boolean;
    createdAt: string; // Store as ISO string
    updatedAt: string; // Store as ISO string
    sameAsHomeAddress?: boolean;
    billingAddress?: Address; 
}


