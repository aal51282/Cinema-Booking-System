export interface Promotion {
    promotionId: number;
    title: string;
    description: string; // This is the unique promotion code
    discountPercentage: number;
    isSent?: boolean;
    sendTime?: string;   // Format: 'HH:MM:SS'
}
