import Database from 'better-sqlite3';
import { User } from '../models/user';  // Assuming you have a User model
import { Payment } from '../models/payment'; 
import { sendUserInfoUpdateEmail, sendPasswordChangeEmail } from '../services/emailService';

const db = new Database('./database/cinema.db');


//* users functions *************************************
// Function to fetch all users
export const getAllUsers = () => {
    try {
        const stmt = db.prepare('SELECT * FROM Users');
        const users = stmt.all();

        return (users as User[]).map((user: User) => ({
            ...user,
            updatedAt: new Date(user.updatedAt).toISOString(),
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Could not retrieve users');
    }
};

// addUser function to handle payments
export const addUser = (user: User): number => {
    try {

        const stmt = db.prepare(`
            INSERT INTO Users (
                email, password, firstName, lastName, phone_number, isAdmin, accountStatus, 
                isPromoted, createdAt, updatedAt, billingAddress
            ) VALUES ($email, $password, $firstName, $lastName, $phone_number, $isAdmin, $accountStatus, $isPromoted, $createdAt, $updatedAt, $billingAddress)
        `);


        const result = stmt.run({
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            phone_number: user.phone_number || null,
            isAdmin: user.isAdmin ? 1 : 0,
            accountStatus: user.accountStatus,
            isPromoted: user.isPromoted ? 1 : 0,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            billingAddress: user.billingAddress || null
        });

        const userId = result.lastInsertRowid as number;

        // Handle payments if present
        // if (user.payments && user.payments.length > 0) {
        //     const paymentStmt = db.prepare(`
        //         INSERT INTO Payment_cards (userId, cardType, cardHolderName, cardNumber, expirationDate, cvv, isDefault, createdAt, updatedAt, billingAddress)
        //         VALUES ($userId,$cardType,$cardHolderName,$cardNumber,$expirationDate,$cvv,$isDefault,$createdAt,$updatedAt,$billingAddress)
        //     `);
        //     user.payments.forEach(payment => {
        //         paymentStmt.run({
        //             userId,
        //             cardType: payment.cardType,
        //             cardHolderName: payment.cardHolderName,
        //             cardNumber: payment.cardNumber,
        //             expirationDate: payment.expirationDate,
        //             cvv: payment.cvv,
        //             isDefault: payment.isDefault ? 1 : 0,
        //             createdAt: payment.createdAt,
        //             updatedAt: payment.updatedAt,
        //             billingAddress: payment.billingAddress
        //         });
        //     });
        // }

        return userId;
    } catch (error) {
        console.error('Error adding user:', error);
        throw new Error('Could not add user');
    }
};

// Function to delete a user
export const deleteUser = (id: number) => {
    try {
        const stmt = db.prepare('DELETE FROM Users WHERE id = ?');
        stmt.run(id);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('Could not delete user');
    }
};

// Function to get a user by ID
export const getUserById = (id: number): User | undefined => {
    try {
        const stmt = db.prepare('SELECT * FROM Users WHERE userId = ?');
        const user = stmt.get(id) as User | undefined;
        if (user) {
            // Fetch the user's payment methods
            const paymentStmt = db.prepare('SELECT * FROM Payment_cards WHERE userId = ?');
            const payments = paymentStmt.all(id) as Payment[];

            return {
                ...user,
                updatedAt: new Date(user.updatedAt).toISOString(),
                billingAddress: user.billingAddress ? JSON.parse(user.billingAddress) : undefined,
                payments: payments
            };
        }
        return undefined;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Could not retrieve user');
    }
};

// Function to get a user by email
export const getUserByEmail = (email: string): User | undefined => {
    try {
        const stmt = db.prepare('SELECT * FROM Users WHERE email = ?');
        const user = stmt.get(email) as User | undefined;
        if (user) {
            // Fetch the user's payment methods
            const paymentStmt = db.prepare('SELECT * FROM Payment_cards WHERE userId = ?');
            const payments = paymentStmt.all(user.userId) as Payment[];

            return {
                ...user,
                updatedAt: new Date(user.updatedAt).toISOString(),
                payments: payments,
                billingAddress: user.billingAddress ? JSON.parse(user.billingAddress) : undefined
            };
        }
        return undefined;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Could not retrieve user');
    }
};

// the updateUser function
export const updateUser = async (user: Partial<User>) => {
    try {
        let query = 'UPDATE Users SET ';
        const updateFields: string[] = [];
        const values: any[] = [];
        const updatedFieldNames: string[] = [];

        if (user.email !== undefined) {
            updateFields.push('email = ?');
            values.push(user.email);
            updatedFieldNames.push('Email');
        }
        if (user.password !== undefined) {
            updateFields.push('password = ?');
            values.push(user.password);
            updatedFieldNames.push('Password');
        }
        if (user.firstName !== undefined) {
            updateFields.push('firstName = ?');
            values.push(user.firstName);
            updatedFieldNames.push('First Name');
        }
        if (user.lastName !== undefined) {
            updateFields.push('lastName = ?');
            values.push(user.lastName);
            updatedFieldNames.push('Last Name');
        }
        if (user.isAdmin !== undefined) {
            updateFields.push('isAdmin = ?');
            values.push(user.isAdmin ? 1 : 0);
            updatedFieldNames.push('Admin Status');
        }
        if (user.accountStatus !== undefined) {
            updateFields.push('accountStatus = ?');
            values.push(user.accountStatus);
            updatedFieldNames.push('Account Status');
        }
        if (user.isPromoted !== undefined) {
            updateFields.push('isPromoted = ?');
            values.push(user.isPromoted ? 1 : 0);
            updatedFieldNames.push('Promotion Status');
        }
        if (user.phone_number !== undefined) {
            updateFields.push('phone_number = ?');
            values.push(user.phone_number);
            updatedFieldNames.push('Phone Number');
        }
        if (user.billingAddress !== undefined) {
            updateFields.push('billingAddress = ?');
            if (typeof user.billingAddress === 'object') {
                values.push(JSON.stringify(user.billingAddress));
            } else {
                values.push(user.billingAddress);
            }
            updatedFieldNames.push('Billing Address');
        }

        if (updateFields.length === 0) {
            console.log('No fields to update');
            return;
        }

        updateFields.push('updatedAt = ?');
        values.push(new Date().toISOString());

        query += updateFields.join(', ') + ' WHERE userId = ?';
        values.push(user.userId);

        console.log('Update query:', query);
        console.log('Update values:', values);

        const stmt = db.prepare(query);
        const result = stmt.run(...values);
        console.log('Update result:', result);

        if (result.changes === 0) {
            console.log('No rows were updated');
        } else {
            // Send email notification
            const updatedUser = getUserById(user.userId!);
            if (updatedUser) {
                await sendUserInfoUpdateEmail(updatedUser, updatedFieldNames);
            }
        }
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Could not update user');
    }
};
//* end of users functions *************************************


//* payment methods *************************************
// a function to get user payments
export const getUserPayments = (userId: number): Payment[] => {
    try {
        const stmt = db.prepare('SELECT * FROM Payment_cards WHERE userId = ?');
        const payments = stmt.all(userId) as Payment[];
        return payments;
    } catch (error) {
        console.error('Error fetching user payments:', error);
        throw new Error('Could not retrieve user payments');
    }
};

// a function to add payment methods
export const addPaymentMethod = (payment: Payment): number => {
    try {
        
        const stmt = db.prepare(`
        INSERT INTO Payment_cards (userId, cardType, cardHolderName, cardNumber, expirationDate, cvv, isDefault, createdAt, updatedAt, billingAddress)
        VALUES ($userId,$cardType,$cardHolderName,$cardNumber,$expirationDate,$cvv,$isDefault,$createdAt,$updatedAt,$billingAddress)
        `);
        
        const result = stmt.run(
            {userId: payment.userId,
            cardType: payment.cardType,
            cardHolderName: payment.cardHolderName,
            cardNumber: payment.cardNumber,
            expirationDate: payment.expirationDate,
            cvv: payment.cvv,
            isDefault: payment.isDefault ? 1 : 0,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            billingAddress: payment.billingAddress}
        );

        return result.lastInsertRowid as number;
    } catch (error) {
        console.error('Error adding payment method:', error);
        throw new Error('Could not add payment method');
    }
};

// function to delete a payment method
export const deletePaymentMethod = (userId: number, paymentId: number): void => {
    try {
      const stmt = db.prepare('DELETE FROM Payment_cards WHERE userId = ? AND card_id = ?');
      const result = stmt.run(userId, paymentId);
      
      if (result.changes === 0) {
        throw new Error('Payment method not found or could not be deleted');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Could not delete payment method');
    }
};

export const updatePaymentMethodInDB = async (payment: Partial<Payment>): Promise<boolean> => {
    try {
        const updateFields: string[] = [];
        const values: any[] = [];

        if (payment.cardType) {
            updateFields.push('cardType = ?');
            values.push(payment.cardType);
        }
        if (payment.cardHolderName) {
            updateFields.push('cardHolderName = ?');
            values.push(payment.cardHolderName);
        }
        if (payment.cardNumber) {
            updateFields.push('cardNumber = ?');
            values.push(payment.cardNumber);
        }
        if (payment.expirationDate) {
            updateFields.push('expirationDate = ?');
            values.push(payment.expirationDate);
        }
        if (payment.cvv) {
            updateFields.push('cvv = ?');
            values.push(payment.cvv);
        }
        if (payment.isDefault !== undefined) {
            updateFields.push('isDefault = ?');
            values.push(payment.isDefault ? 1 : 0);
        }

        // billing address handling
        if (payment.billingAddress) {
            updateFields.push('billingAddress = ?');
            values.push(payment.billingAddress);
        }

        updateFields.push('updatedAt = ?');
        values.push(new Date().toISOString());

        const query = `UPDATE Payment_cards SET ${updateFields.join(', ')} WHERE card_id = ? AND userId = ?`;

        values.push(payment.card_id, payment.userId);

        const stmt = db.prepare(query);
        const result = stmt.run(...values);
        
        return result.changes > 0;
    } catch (error) {
        console.error('Error updating payment method:', error);
        throw new Error('Could not update payment method');
    }
};
//* end of payment methods *************************************


//* password functions *************************************
//function to update the password and passwordChangedAt
export const updatePassword = async (userId: number, newPassword: string) => {
    try {
        const stmt = db.prepare('UPDATE Users SET password = ?, updatedAt = ? WHERE userId = ?');
        stmt.run(newPassword, new Date().toISOString(), userId);
        
        // Send email notification
        const user = getUserById(userId);
        if (user) {
            await sendPasswordChangeEmail(user);
        }
    } catch (error) {
        console.error('Error updating password:', error);
        throw new Error('Could not update password');
    }
};
//* end of password functions *************************************



//* promotion functions *************************************
// function to update the user's promoted status, default to false, one user can only add one promotion code
export const updatePromotedStatus = (userId: number, isPromoted: boolean) => {
    try {
        const stmt = db.prepare('UPDATE Users SET isPromoted = ? WHERE userId = ?');
        stmt.run(isPromoted, userId);
    } catch (error) {
        console.error('Error updating promoted status:', error);
        throw new Error('Could not update promoted status');
    }
};
//* end of promotion functions *************************************
