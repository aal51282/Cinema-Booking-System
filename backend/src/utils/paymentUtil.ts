import { Payment } from '../models/payment';

export const validatePaymentCard = (payment: Payment): boolean => {
  // Add card type validation
  if (!payment.cardType || !['Visa', 'MasterCard', 'Amex'].includes(payment.cardType)) {
    return false;
  }
  // Implement card validation logic here
  // This is a simple example and should be expanded then
  if (!payment.cardNumber || payment.cardNumber.length !== 16) {
    return false;
  }
  if (!payment.expirationDate || !/^\d{2}\/\d{2}$/.test(payment.expirationDate)) {
    return false;
  }
  const [month, year] = payment.expirationDate.split('/').map(num => parseInt(num, 10));
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits of year
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  
  if (month < 1 || month > 12) {
    return false;
  }
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  if (!payment.cvv || payment.cvv.length !== 3) {
    return false;
  }
  if (!payment.cardHolderName || payment.cardHolderName.trim().length === 0) {
    return false;
  }
  return true;
};
