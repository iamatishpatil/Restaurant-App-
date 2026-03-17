import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import path from "path";
import { errorMiddleware } from "./middlewares/errorMiddleware";

dotenv.config();

import authRoutes from "./routes/authRoutes";
import menuRoutes from "./routes/menuRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import addressRoutes from "./routes/addressRoutes";
import tableRoutes from "./routes/tableRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import reservationRoutes from "./routes/reservationRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import couponRoutes from "./routes/couponRoutes";
import { socketService } from "./services/socketService";

const app: Application = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health & Welcome
app.get("/", (req: Request, res: Response) => {
  res.json({ 
    message: "Welcome to the Restaurant API", 
    documentation: "/health" 
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "Restaurant API is running" });
});

// Global Error Handler - Must be after all routes
app.use(errorMiddleware);

// Initialize Socket.io
socketService.init(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export { prisma };
