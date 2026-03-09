# Restaurant Application System

Welcome to the comprehensive Restaurant Application System. This project encompasses a complete software ecosystem for a scalable, single-restaurant operation. It features a robust **Backend API**, a powerful **Admin Dashboard**, and a premium **Customer Mobile App**.

## Architecture Overview

- **Database**: PostgreSQL (Managed via Prisma ORM)
- **Backend API**: Node.js + Express + TypeScript
- **Admin Dashboard**: React.js + Vite + Tailwind CSS + Lucide Icons
- **Customer App**: Flutter + Dart + Provider

## 1. Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Flutter SDK](https://flutter.dev/docs/get-started/install)
- [PostgreSQL](https://www.postgresql.org/) running locally
- A code editor like VS Code or Android Studio.

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd "backend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `backend` directory with:
   ```env
   DATABASE_URL="postgresql://postgres:12345@localhost:5432/restaurant_db?schema=public"
   JWT_SECRET="your_very_secure_secret_key"
   PORT=5000
   ```
4. Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### Admin Dashboard Setup
1. Open a new terminal and navigate to the admin dashboard directory:
   ```bash
   cd "admin-dashboard"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:5173`. Use the default admin credentials (if seeded) or create one via the `/api/auth/signup` endpoint with the `ADMIN` role.

### Customer Mobile Setup
1. Ensure you have an Android emulator running or a device connected.
2. Open a new terminal and navigate to the mobile app directory:
   ```bash
   cd "customer-app/customer_app"
   ```
3. Get Flutter packages:
   ```bash
   flutter pub get
   ```
4. Run the app:
   ```bash
   flutter run
   ```
   *Note: Ensure the base URL in `lib/services/api_service.dart` is correctly pointing to your local machine's IP (e.g., `http://192.168.x.x:5000/api`) when running on a physical device, or `http://10.0.2.2:5000/api` for an Android emulator.*

---

## 2. API Documentation

The backend REST API handles all business logic. All protected routes require a `Bearer <token>` in the Authorization header.

### Authentication (`/api/auth`)
- `POST /signup` - Register a new user (`name`, `email`, `phone`, `password`, `role`).
- `POST /login` - Authenticate a user and receive a JWT.
- `GET /users` - *(Admin)* Retrieve all users.

### Menu (`/api/menu`)
- `GET /categories` - Retrieve all menu categories.
- `GET /items` - Retrieve all menu items.
- `GET /items/category/:categoryId` - Retrieve items for a specific category.
- `GET /items/:id` - Get details of a single menu item.

### Orders (`/api/orders`)
- `POST /` - *(Auth)* Create a new order (requires `items`, `totalPrice`, `deliveryType`).
- `GET /my` - *(Auth)* Get order history for the logged-in user.
- `GET /:id` - *(Auth)* Get specific order details.

### Admin Operations (`/api/admin`)
*(All routes require `ADMIN` or `MANAGER` role)*
- `GET /categories`, `POST /categories` - Manage categories.
- `GET /coupons`, `POST /coupons` - Manage discount coupons.
- `GET /banners`, `POST /banners` - Manage promotional banners.
- `GET /staff`, `POST /staff` - Manage restaurant staff members.
- `GET /inventory`, `PUT /inventory/:id` - Track and update stock levels.
- `PUT /orders/:id/status` - Update the status of a specific order (triggers notification).

### Uploads (`/api/upload`)
- `POST /` - Upload an image file (multipart/form-data with field `image`). Returns `imageUrl`.

### Address (`/api/address`)
*(Auth required)*
- `GET /` - Get user addresses.
- `POST /` - Create a new address.
- `DELETE /:id` - Delete an address.

### Reviews (`/api/reviews`)
- `GET /` - Retrieve all reviews.
- `GET /item/:menuItemId` - Get reviews for a specific dish.
- `POST /` - *(Auth)* Leave a review for a dish.

---

## 3. Maintenance & Scripts

- **Prisma Studio**: To manually inspect the database, run `npx prisma studio` in the `backend` folder.
- **Image Uploads**: Images are stored locally in `backend/uploads`. In a production environment, configure `uploadMiddleware.ts` to push these to an AWS S3 bucket or Firebase Storage.
- **Push Notifications**: The `notificationService.ts` currently mocks notifications. For production, integrate the Firebase Admin SDK.
