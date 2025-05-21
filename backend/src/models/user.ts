import { Address, Payment } from './payment';

export enum AccountStatus {
  Active = 'Active',
  Inactive = 'Inactive'
}

export interface User {
  userId?: number;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone_number?: string;
  isAdmin: boolean;  
  accountStatus: AccountStatus;
  isPromoted: boolean; // whether the user added a promotion code
  createdAt: string; // Store as ISO string, default to current date
  updatedAt: string; // Store as ISO string
  addresses?: Address[]; // Array of associated addresses
  payments?: Payment[]; // Array of associated payment methods
  billingAddress?: string; // JSON string or separate fields
}
