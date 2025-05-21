import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { AccountStatus, User } from '../models/user';
import { Booking } from '../models/booking';
import { Payment } from '../models/payment';
import { getMTitleByShowId } from '../controllers/bookingController';

// Function to create the transporter
const create_fake_Transporter = () => {
  console.log('Creating email transporter with configuration:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const createTransporter = () => {
  console.log('Creating email transporter with Gmail configuration');
  console.log(`GMAIL_USER Host: ${process.env.GMAIL_USER}`);
  console.log(`GMAIL_PASS: ${process.env.GMAIL_PASS}`);
  console.log(`GMAIL_CLIENT_ID: ${process.env.GMAIL_CLIENT_ID}`);
  console.log(`GMAIL_CLIENT_SECRET: ${process.env.GMAIL_CLIENT_SECRET}`);
  console.log(`GMAIL_REFRESH_TOKEN: ${process.env.GMAIL_REFRESH_TOKEN}`);

  return nodemailer.createTransport({
    service: 'gmail',
    host: process.env.GMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

export const sendPasswordChangeEmail = async (user: User): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Password Change Confirmation',
    text: `Your password has been successfully changed. If you did not make this change, please contact our support team immediately.`,
    html: `
      <h1>Password Change Confirmation</h1>
      <p>Your password has been successfully changed.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      <p>Time of change: ${new Date().toLocaleString()}</p>
    `,
  };

  try {
    console.log('Sending password change confirmation email...');
    await transporter.sendMail(mailOptions);
    console.log(`Password change confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending password change confirmation email:', error);
    throw new Error('Failed to send password change confirmation email');
  }
};

export const sendVerificationEmail = async (user: User, token: string): Promise<void> => {
  const transporter = createTransporter();
  const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking on this link: \n${verificationLink}`,
    html: `<p>Please verify your email by clicking on this link: \n<a href="${verificationLink}">${verificationLink}</a></p>`,
  };

  try {
    console.log('Verifying SMTP connection...');
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log('SMTP connection error:', error);
          reject(error);
        } else {
          console.log("SMTP connection successful");
          resolve(success);
        }
      });
    });

    console.log('Sending email...');
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${user.email}`);
  } catch (error) {
    console.error('Error in email sending process:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (user: User, token: string): Promise<void> => {
  const transporter = createTransporter();
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Password Reset',
    text: `Click on this link to reset your password:\n${resetLink}\nThis link will expire in 10 minutes.`,
    html: `
      <p>Click on this link to reset your password:\n<a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 10 minutes.</p>
    `,
  };

  try {
    console.log('Sending password reset email...');
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendUserInfoUpdateEmail = async (user: User, updatedFields: string[]): Promise<void> => {
  const transporter = createTransporter();

  let subject, text, html;

  if (updatedFields.length === 1 && updatedFields[0] === 'Password') {
    subject = 'Your Password Has Been Changed';
    text = `Your account password has been successfully changed. If you did not make this change, please contact our support team immediately.`;
    html = `
      <h1>Password Change Notification</h1>
      <p>Your account password has been successfully changed.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
    `;
  } else {
    subject = 'Your Account Information Has Been Updated';
    text = `Your account information has been updated. The following fields were changed: ${updatedFields.join(', ')}.`;
    html = `
      <h1>Account Information Update</h1>
      <p>Your account information has been updated. The following fields were changed:</p>
      <ul>
        ${updatedFields.map(field => `<li>${field}</li>`).join('')}
      </ul>
      <p>If you did not make these changes, please contact our support team immediately.</p>
    `;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject,
    text,
    html,
  };

  try {
    console.log('Sending user info update email...');
    await transporter.sendMail(mailOptions);
    console.log(`User info update email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending user info update email:', error);
    throw new Error('Failed to send user info update email');
  }
};

export const sendPromotionEmail = async (to: string, promotion: any): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `New Promotion: ${promotion.title}`,
    text: `
      ${promotion.title}
      
      ${promotion.description}
      
      Discount: ${promotion.discountPercentage}%
    
    `,
    html: `
      <h1>${promotion.title}</h1>
      <p>${promotion.description}</p>
      <p><strong>Discount:</strong> ${promotion.discountPercentage}%</p>
    `
  };

  try {
    console.log('Sending promotion email...');
    await transporter.sendMail(mailOptions);
    console.log(`Promotion email sent to ${to}`);
  } catch (error) {
    console.error('Error sending promotion email:', error);
    throw new Error('Failed to send promotion email');
  }
};

export const sendAccountStatusChangeEmail = async (user: User, newStatus: AccountStatus): Promise<void> => {
  const transporter = createTransporter();

  const subject = `Your Account Status Has Been Updated`;
  const text = newStatus === AccountStatus.Inactive
    ? `Dear ${user.firstName},\n\nYour account has been suspended. If you believe this is an error, please contact our support team immediately at ${process.env.SUPPORT_EMAIL}.`
    : `Dear ${user.firstName},\n\nYour account has been reactivated. You can now access all features of our platform. Thank you for your patience.`;

  const html = newStatus === AccountStatus.Inactive
    ? `
      <h1>Account Suspended</h1>
      <p>Dear ${user.firstName},</p>
      <p>Your account has been suspended.</p>
      <p>If you believe this is an error, please contact our support team immediately at 
        <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>
      </p>
      <p>Time of suspension: ${new Date().toLocaleString()}</p>
    `
    : `
      <h1>Account Reactivated</h1>
      <p>Dear ${user.firstName},</p>
      <p>Your account has been reactivated.</p>
      <p>You can now access all features of our platform.</p>
      <p>Thank you for your patience.</p>
      <p>Time of reactivation: ${new Date().toLocaleString()}</p>
    `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject,
    text,
    html
  };

  try {
    console.log('Sending account status change email...');
    await transporter.sendMail(mailOptions);
    console.log(`Account status change email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending account status change email:', error);
    // We're not throwing the error to prevent breaking the status update flow
    // but we still log it for monitoring purposes
  }
};

const createTestTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '2525'),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: true
    });
};

export const sendBookingEmail = async (
    to: string,
    firstName: string | undefined, 
    booking: Booking,
    paymentCard: Partial<Payment>,
    tickets: any[]
): Promise<void> => {
    try {
        const transporter = createTransporter();
        // Mask card number except last 4 digits
        const maskedCardNumber = paymentCard.cardNumber?.slice(-4)?.padStart(paymentCard.cardNumber?.length || 16, '*') || '****';

        const ticketDetails = await Promise.all(tickets.map(async (ticket) => {
          const movieTitle = getMTitleByShowId(ticket.showId); // Get the movie title
          return {
                seatNumber: ticket.seatNumber,
                ticketType: ticket.ticketType,
                movieTitle: movieTitle || 'Unknown Movie' // Fallback if title is not found
          };
      }));

      const ticketInfo = ticketDetails.map(detail => 
        `- Seat: ${detail.seatNumber} (Type: ${detail.ticketType}, Movie: ${detail.movieTitle})`
    ).join('\n');


        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: to,
            subject: `Booking Confirmation - Booking ID: ${booking.bookingId}`,
            text: `
                Dear ${firstName},

                Thank you for your booking!

                Booking Details:
                - Booking ID: ${booking.bookingId}
                - Booking Date: ${new Date(booking.bookingDate * 1000).toLocaleString()}
                - Total Amount: $${booking.totalAmount}
                - Payment Status: ${booking.paymentStatus}
                - Payment Method: **** **** **** ${maskedCardNumber}

                Tickets:
                ${ticketInfo}

                Enjoy your movie!

                Best Regards,
                GoDawgsCinemax Team
            `,
            html: `
                <h1>Booking Confirmation</h1>
                <p>Dear ${firstName},</p>
                <p>Thank you for your booking!</p>
                <h2>Booking Details</h2>
                <ul>
                    <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
                    <li><strong>Booking Date:</strong> ${new Date(booking.bookingDate * 1000).toLocaleString()}</li>
                    <li><strong>Total Amount:</strong> $${booking.totalAmount}</li>
                    <li><strong>Payment Status:</strong> ${booking.paymentStatus}</li>
                    <li><strong>Payment Method:</strong> **** **** **** ${maskedCardNumber}</li>
                </ul>
                <h2>Tickets</h2>
                <ul>
                    ${ticketDetails.map(detail => `<li><strong>Seat:</strong> ${detail.seatNumber} (Type: ${detail.ticketType}, Movie: ${detail.movieTitle})</li>`).join('')}
                </ul>
                <p>Enjoy your movie!</p>
                <p>Best Regards,<br/>GoDawgsCinemax Team</p>
            `
        };

        console.log('Sending booking confirmation email...');
        await transporter.sendMail(mailOptions);
        console.log(`✅ Booking confirmation email sent to ${to}`);
    } catch (error: any) { // Updated to 'any' to handle unknown types
        console.error('Detailed email error:', error.message);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
        throw new Error('Failed to send booking email');
    }
};
