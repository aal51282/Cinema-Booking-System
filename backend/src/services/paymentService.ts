import { Payment } from '../models/payment';
import { addPaymentMethod, getUserPayments, deletePaymentMethod, updatePaymentMethodInDB } from '../controllers/userController';
import { validatePaymentCard } from '../utils/paymentUtil';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import Database from 'better-sqlite3';
const db = new Database('./database/cinema.db');
//load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const algorithm = 'aes-256-cbc';

if (!process.env.AES_KEY) {
  throw new Error('AES_KEY must be defined in environment variables');
}

if (!process.env.AES_IV) {
  throw new Error('AES_IV must be defined in environment variables');
}

const key = Buffer.from(process.env.AES_KEY!, 'utf-8');
const iv = Buffer.from(process.env.AES_IV!, 'utf-8');

const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (encrypted: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const addPaymentMethods = async (payments: Payment[]): Promise<number[]> => {
  try {
    const currentCount = await getUserPaymentCount(payments[0].userId);
    if (currentCount + payments.length > 3) {
      throw new Error('Maximum limit of three payment cards reached. Please remove an existing card before adding a new one.');
    }

    const validPayments = payments.filter(validatePaymentCard);
    if (validPayments.length === 0) {
      throw new Error('Invalid payment information provided');
    }
    
    const encryptedPayments = validPayments.map(payment => ({
      ...payment,
      cardNumber: encrypt(payment.cardNumber),
      cvv: encrypt(payment.cvv),
      cardType: payment.cardType
    }));

    const paymentIds = await Promise.all(encryptedPayments.map(addPaymentMethod));
    return paymentIds;
  } catch (error) {
    // Rethrow the error to be handled by the controller
    throw error;
  }
};

export const deleteUserPaymentMethod = async (userId: number, paymentId: number): Promise<boolean> => {
  try {
    deletePaymentMethod(userId, paymentId);
    return true;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return false;
  }
};

export const updatePaymentMethod = async (payment: Partial<Payment>): Promise<boolean> => {
  try {
    // Validate the payment data if it's being updated
    if (payment.cardNumber || payment.cvv || payment.cardType || payment.expirationDate) {
      const fullPayment = await getUserPayments(payment.userId!).find(p => p.card_id === payment.card_id);
      if (!fullPayment) {
        throw new Error('Payment method not found');
      }
      
      const paymentToValidate = {
        ...fullPayment,
        ...payment
      };
      
      if (!validatePaymentCard(paymentToValidate as Payment)) {
        throw new Error('Invalid payment information');
      }
    }

    // Encrypt sensitive data if it's being updated
    const encryptedPayment = {
      ...payment,
      cardNumber: payment.cardNumber ? encrypt(payment.cardNumber) : undefined,
      cvv: payment.cvv ? encrypt(payment.cvv) : undefined
    };

    return await updatePaymentMethodInDB(encryptedPayment); // You'll need to import this from your database layer
  } catch (error) {
    console.error('Error updating payment method:', error);
    return false;
  }
};


export const getDecryptedUserPayments = async (userId: number): Promise<Partial<Payment>[]> => {
  const payments = await getUserPayments(userId);
  return payments.map(payment => ({
    ...payment,
    cardNumber: decrypt(payment.cardNumber),
    cvv: decrypt(payment.cvv)
  }));
};

export const userHasAddress = async(userId: number): Promise<boolean> => {
  const result = await db.prepare('SELECT COUNT(*) as count FROM Users WHERE userId = ? AND billingAddress IS NOT NULL').get(userId) as { count: number };
  return result.count > 0;
};

export const getUserPaymentCount = async (userId: number): Promise<number> => {
  const payments = await getUserPayments(userId);
  console.log('Retrieved payments for user:', userId, payments);
  return payments.length;
};