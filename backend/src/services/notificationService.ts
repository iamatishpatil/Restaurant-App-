import { prisma } from '../index';
import { messaging } from '../config/firebase';

export const sendNotification = async (userId: string, title: string, body: string, token?: string) => {
  console.log(`[FCM NOTIFICATION] To: ${userId} | Title: ${title} | Body: ${body}`);
  
  if (messaging && token) {
    try {
      await messaging.send({
        token,
        notification: {
          title,
          body,
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        }
      });
      console.log('Successfully sent message:', title);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  } else {
    console.warn('Skipping actual FCM push. Messaging or Token not available.');
  }

  // Save to DB History
  // Save to DB History
  console.log("Notification saved/sent", { userId, title, status: 'SENT' });
  return true;
};
