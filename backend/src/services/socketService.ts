import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

class SocketService {
  private io: Server | null = null;

  init(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // In production, replace with your frontend URL
        methods: ['GET', 'POST'],
      },
    });

    console.log('⚡ Socket.io initialized');

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle joining specific rooms
      socket.on('join_room', (room: string) => {
        socket.join(room);
        console.log(`🏠 Client ${socket.id} joined room: ${room}`);
      });

      socket.on('disconnect', () => {
        console.log(`👋 Client disconnected: ${socket.id}`);
      });
    });
  }

  // Notify whenever a new order is placed
  notifyNewOrder(order: any) {
    if (this.io) {
      this.io.to('kitchen').to('admins').emit('new_order', order);
      console.log('📢 New order broadcasted to kitchen and admins');
    }
  }

  // Notify whenever an order status changes
  notifyStatusUpdate(orderId: string, status: string) {
    if (this.io) {
      this.io.to('kitchen').to('admins').to('waiters').to(`order_${orderId}`).emit('status_update', {
        orderId,
        status,
      });
      console.log(`📢 Status update for ${orderId}: ${status}`);
    }
  }

  // Notify waiter that food is ready
  notifyReadyForPickup(order: any) {
    if (this.io) {
      this.io.to('waiters').emit('order_ready', order);
      console.log('📢 Waiter notified: Order Ready');
    }
  }
}

export const socketService = new SocketService();
