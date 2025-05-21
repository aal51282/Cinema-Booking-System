import { Request, Response } from 'express';
import { Payment } from '../models/payment';
import { userHasAddress,addPaymentMethods, getDecryptedUserPayments, deleteUserPaymentMethod, updatePaymentMethod, getUserPaymentCount } from '../services/paymentService';

export const addPayment = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Check for billing address
    const userHasBillingAddress = await userHasAddress(userId);
    if (!userHasBillingAddress && !req.body.billingAddress) {
      return res.status(400).json({ 
        success: false,
        message: 'A billing address is required because the user has no billing address on file'
      });
    }

    // Check current number of cards
    const currentCardCount = await getUserPaymentCount(userId);
    if (currentCardCount >= 3) {
      console.log('Rejecting due to card limit');
      return res.status(400).json({ 
        success: false,
        message: 'Maximum limit of 3 payment cards reached. Please remove an existing card before adding a new one.'
      });
    }

    const payment: Payment = {
      ...req.body,
      cardType: req.body.cardType,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate card type
    if (!payment.cardType || !['Visa', 'MasterCard', 'Amex'].includes(payment.cardType)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or missing card type' 
      });
    }

    const [paymentId] = await addPaymentMethods([payment]);

    return res.status(201).json({ 
      success: true,
      message: 'Payment method added successfully', 
      paymentId 
    });

  } catch (error) {
    console.error('Error adding payment method:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('three payment cards')) {
        return res.status(400).json({ 
          success: false,
          message: 'You cannot add more than three payment cards'
        });
      }
      else if (error.message.includes('Invalid payment information')) {
        return res.status(400).json({ 
          success: false,
          message: error.message
        });
      }
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
    
    // Handle unknown errors
    return res.status(500).json({ 
      success: false,
      message: 'An unexpected error occurred while adding the payment method'
    });
  }
};

export const getUserPaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const decryptedPayments = await getDecryptedUserPayments(userId);

    res.json(decryptedPayments);
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ message: 'Error fetching user payments' });
  }
};


export const deletePayment = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const paymentId = parseInt(req.params.paymentId);

    if (isNaN(userId) || isNaN(paymentId)) {
      return res.status(400).json({ message: 'Invalid user ID or payment ID' });
    }

    const success = await deleteUserPaymentMethod(userId, paymentId);

    if (success) {
      res.json({ message: 'Payment method deleted successfully' });
    } else {
      res.status(404).json({ message: 'Payment method not found or could not be deleted' });
    }
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: 'Error deleting payment method' });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const paymentId = parseInt(req.params.paymentId);
    
    if (isNaN(userId) || isNaN(paymentId)) {
      return res.status(400).json({ message: 'Invalid user ID or payment ID' });
    }

    const userHasBillingAddress = await userHasAddress(userId);
    if (!userHasBillingAddress && !req.body.billingAddress) {
      return res.status(400).json({ message: 'A billing address is required because the user has no billing address on file'});
    }

    const updateData: Partial<Payment> = {
      ...req.body,
      card_id: paymentId,
      userId: userId,
      updatedAt: new Date().toISOString(),
      billingAddress: req.body.billingAddress ? req.body.billingAddress : undefined
    };

    

    if(!updateData.cardType) {
      return res.status(400).json({ message: 'Missing card type'})
    }

    if(updateData.cardNumber && !/^\d{16}$/.test(updateData.cardNumber)){
      return res.status(400).json({ message: 'Invalid card number format' });
    }

    const success = await updatePaymentMethod(updateData);

    if (success) {
      res.json({ message: 'Payment method updated successfully' });
    } else {
      res.status(404).json({ message: 'Payment method not found or could not be updated' });
    }
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ 
      message: 'Error updating payment method',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
