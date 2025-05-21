import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movieR';
import authRoutes from './routes/authR';  
import paymentRoutes from './routes/paymentR';
import userRoutes from './routes/userR';
import promotionRoutes from './routes/promotionR';
import ticketRoutes from './routes/ticketR';
import cartRoutes from './routes/cartR';
import { schedulePromotionSending } from './services/promotionSender';
import bookingRoutes from './routes/bookingR';
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors(
    {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }
));
app.use(express.json());

// Add routes
app.use(movieRoutes);
app.use('/api/auth', authRoutes);  // note: we need to add the /api prefix to Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/bookings', bookingRoutes);

schedulePromotionSending();

const startServer = async () => {
    try {
        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error(`Error starting server:`, error);
    }
};

startServer();
