// @ts-ignore
import EscPosEncoder from 'esc-pos-encoder';
import net from 'net';
import { prisma } from '../index';

export class PrinterService {
  /**
   * Generates ESC/POS commands for a Kitchen Order Ticket (KOT)
   */
  async generateKOT(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true,
        user: true
      }
    });

    if (!order) return null;

    const encoder = new EscPosEncoder();
    let result = encoder
      .initialize()
      .align('center')
      .size('double')
      .text('KITCHEN ORDER')
      .newline()
      .size('normal')
      .text('--------------------------------')
      .newline()
      .align('left')
      .text(`Order: #${order.orderNumber || order.id.slice(-4)}`)
      .newline()
      .text(`Table: ${order.table?.tableNumber || 'N/A'}`)
      .newline()
      .text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
      .newline()
      .text('--------------------------------')
      .newline()
      .bold(true)
      .text('Items           Qty')
      .bold(false)
      .newline();

    order.orderItems.forEach((item: any) => {
      const name = item.menuItem.name.padEnd(20).slice(0, 20);
      const qty = item.quantity.toString().padStart(4);
      result = result.text(`${name} ${qty}`).newline();
      if (item.notes) {
        result = result.italic(true).text(`  * ${item.notes}`).italic(false).newline();
      }
    });

    result = result
      .text('--------------------------------')
      .newline()
      .cut()
      .encode();

    return result;
  }

  /**
   * Sends raw bytes to a network printer
   */
  async printToNetwork(ip: string, port: number, data: Uint8Array) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.setTimeout(5000);

      client.connect(port, ip, () => {
        client.write(Buffer.from(data));
        client.end();
        resolve(true);
      });

      client.on('error', (err) => {
        console.error(`Printer Error (${ip}:${port}):`, err.message);
        client.destroy();
        reject(err);
      });

      client.on('timeout', () => {
        console.error(`Printer Timeout (${ip}:${port})`);
        client.destroy();
        reject(new Error('Printer timeout'));
      });
    });
  }

  /**
   * Auto-print high-level logic
   */
  async autoPrintKDS(orderId: string) {
    try {
      const printers = await prisma.printer.findMany({
        where: { usage: 'KITCHEN' } 
      });

      if (printers.length === 0) {
        console.log('No kitchen printers configured.');
        return;
      }

      const kotData = await this.generateKOT(orderId);
      if (!kotData) return;

      await Promise.allSettled(
        printers.map(p => {
          const [ip, portStr] = p.connection.split(':');
          const port = parseInt(portStr) || 9100;
          return this.printToNetwork(ip, port, kotData);
        })
      );
    } catch (err) {
      console.error('AutoPrint KOT failed:', err);
    }
  }

  async generateBill(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true,
        user: true,
        payment: true
      }
    });

    if (!order) return null;

    const encoder = new EscPosEncoder();
    let result = encoder
      .initialize()
      .align('center')
      .size('double')
      .text('Gourmet Kitchen')
      .newline()
      .size('normal')
      .text('123 Culinary St, Food City')
      .newline()
      .text('Tel: +1 (555) 000-1111')
      .newline()
      .text('--------------------------------')
      .newline()
      .align('left')
      .text(`Receipt: #${order.orderNumber || order.id.slice(-4)}`)
      .newline()
      .text(`Table: ${order.table?.tableNumber || 'N/A'}`)
      .newline()
      .text(`Date: ${new Date().toLocaleString()}`)
      .newline()
      .text('--------------------------------')
      .newline()
      .bold(true)
      .text('Item             Qty   Price    Total')
      .bold(false)
      .newline();

    order.orderItems.forEach((item: any) => {
      const name = item.menuItem.name.padEnd(16).slice(0, 16);
      const qty = item.quantity.toString().padStart(3);
      const price = item.price.toString().padStart(7);
      const total = (item.quantity * item.price).toString().padStart(7);
      result = result.text(`${name}${qty}${price}${total}`).newline();
    });

    const subtotal = Number(order.totalPrice);
    const tax = subtotal * 0.05; // 5% tax example
    const total = subtotal + tax;

    result = result
      .text('--------------------------------')
      .newline()
      .align('right')
      .text(`Subtotal: ${subtotal.toFixed(2)}`)
      .newline()
      .text(`Tax (5%): ${tax.toFixed(2)}`)
      .newline()
      .bold(true)
      .text(`TOTAL: ${total.toFixed(2)}`)
      .bold(false)
      .newline()
      .align('center')
      .newline()
      .text('Thank you for dining with us!')
      .newline()
      .text('Please visit again')
      .newline()
      .cut()
      .encode();

    return result;
  }

  async autoPrintBill(orderId: string) {
    try {
      const printers = await prisma.printer.findMany({
        where: { usage: 'BILLING' } 
      });

      if (printers.length === 0) {
        // Fallback to kitchen printer if no billing printer exists
        const fallback = await prisma.printer.findFirst({ where: { usage: 'KITCHEN' } });
        if (fallback) printers.push(fallback);
        else return;
      }

      const billData = await this.generateBill(orderId);
      if (!billData) return;

      await Promise.allSettled(
        printers.map(p => {
          const [ip, portStr] = p.connection.split(':');
          const port = parseInt(portStr) || 9100;
          return this.printToNetwork(ip, port, billData);
        })
      );
    } catch (err) {
      console.error('AutoPrint Bill failed:', err);
    }
  }
}

export const printerService = new PrinterService();
