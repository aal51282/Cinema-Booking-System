import cron from 'node-cron'; 
import { sendPromotionEmail } from './emailService';
import { getPromotionsInternal } from '../controllers/promotionController';
import { markPromotionAsSent } from '../controllers/promotionController';
import { getSubscribedUsers } from '../controllers/promotionController';

export const schedulePromotionSending = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const promotions = await getPromotionsInternal();
            const now = new Date();

            for (const promotion of promotions) {
                const sendTimeString = promotion.sendTime || '10:00:00';
                const [hours, minutes] = sendTimeString.split(':').map(Number);
                const sendTime = new Date(); 
                sendTime.setHours(hours, minutes, 0);
                if (sendTime <= now && !promotion.isSent) {
                    const subscribedUsers = await getSubscribedUsers(); 
                    for (const user of subscribedUsers) {
                        await sendPromotionEmail(user.email, promotion); 
                    }
                    await markPromotionAsSent(promotion.promotionId);
                }
            }
        } catch (error) {
            console.error('Error in scheduled promotion sending:', error);
        }
    });
}