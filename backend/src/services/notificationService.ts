import { prisma } from '../index';
import { messaging } from '../config/firebase';

export const sendNotification = async (userId: string, title: string, body: string, token?: string) => {
  let fcmToken = token;

  // If no token provided, try to find it in DB
  if (!fcmToken) {
    const user: any = await prisma.user.findUnique({ where: { id: userId }, select: { fcmToken: true } as any });
    if (user?.fcmToken) {
      fcmToken = user.fcmToken;
    } else {
      const staff: any = await prisma.staff.findUnique({ where: { id: userId }, select: { fcmToken: true } as any });
      if (staff?.fcmToken) {
        fcmToken = staff.fcmToken;
      }
    }
  }

  console.log(`[FCM NOTIFICATION] To: ${userId} | Title: ${title} | Token: ${fcmToken ? 'Present' : 'Missing'}`);
  
  if (messaging && fcmToken) {
    try {
      await messaging.send({
        token: fcmToken,
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
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message: body,
        type: 'ORDER', // Default type, can be improved later
        isRead: false,
      },
    });
    console.log("Notification saved to DB", { userId, title });
  } catch (error) {
    console.error("Failed to save notification to DB:", error);
  }
  
  return true;
};
