# 🔄 BOOKLOOP

### *Circular Marketplace for Academic Resources*

[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-PERN-blue)](#)
[![Date](https://img.shields.io/badge/Updated-May%2024%2C%202026-orange)](#)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

**BOOKLOOP** is a high-performance, premium, full-stack marketplace designed for students to buy, sell, and exchange academic materials. Focused on sustainability, circular economy, and structured academic exchanges, it bridges the gap between academic needs and resource longevity. Featuring an immersive 3D landing page, glassmorphic UI, custom dashboards, direct book swapping, and match alerts, BOOKLOOP represents a state-of-the-art solution for educational communities.

---

## 🌟 Key Features & Core Logic

### 🌀 1. 3D Immersive Landing Experience
Rather than a standard, static homepage, BOOKLOOP greets users with an immersive, interactive 3D hero showcase powered by **React Three Fiber (R3F)** and **Three.js**.
- Custom 3D book models loaded dynamically into the canvas.
- Reactive animations that rotate and follow the user's cursor movements.
- Sleek modern typography layered on top of a canvas using smooth css transitions.
- Source Files: See [BookModel.jsx](file:///e:/Downloads/BOOKLOOP/BOOKLOOP-1c2f434f30d5bdce1a1deff598afeff9a08e564b/frontend/src/components/home/BookModel.jsx) and [BookMesh.js](file:///e:/Downloads/BOOKLOOP/BOOKLOOP-1c2f434f30d5bdce1a1deff598afeff9a08e564b/frontend/src/components/home/BookMesh.js).

### 🔄 2. Direct Book Swapping Logic
Students don't just spend currency; they can trade assets. Our advanced purchase engine handles both traditional buying transactions and peer-to-peer bartering.
- **Swap Requests**: When creating a request, buyers can choose a `request_type` of `'swap'` and submit their own approved listing via `offered_book_id` as direct barter.
- **Transaction Isolation**: Accepting a swap/buy request instantly sets all competing requests for that specific listing to `'rejected'` and automatically flags the book status as `'sold'` inside a secure PostgreSQL transaction block.
- Source File: See [requestController.js](file:///e:/Downloads/BOOKLOOP/BOOKLOOP-1c2f434f30d5bdce1a1deff598afeff9a08e564b/backend/controllers/requestController.js).

### 🔔 3. Intelligent Wishlist Match Alerts
- Students can create search query watchwords.
- When new books are listed matching a user's active wishlist keywords, match notifications or direct list queries highlight these academic listings immediately.
- Source File: See [wishlistController.js](file:///e:/Downloads/BOOKLOOP/BOOKLOOP-1c2f434f30d5bdce1a1deff598afeff9a08e564b/backend/controllers/wishlistController.js).

### 🎭 4. Granular Multi-Role Ecosystem
- **Admin**: Has overarching systems visibility. Dedicated dashboard displaying real-time metrics (user signups, listed books, pending approvals), active list of users, and review moderation. Admin must review, approve, or reject newly listed books before they become searchable on the marketplace.
- **Seller**: Dedicated dashboard to publish and manage catalog (multi-image uploads via Cloudinary storage), view status of listings (`pending`, `approved`, `rejected`, `sold`), and review incoming purchase/barter requests.
- **Buyer**: Sleek marketplace UI with sorting and filtering options (by class, subject, price, and quality condition). Can initiate purchases, view outgoing requests, and review sellers.

### 🛡️ 5. Secure Authentication & Verification
- High-level multi-role credentials using JWT and Bcrypt passwords.
- Built-in **OTP verification** hashes and stores short-lived verification codes in the database, verifying email/phone channels before listing privileges or phone confirmations are completed.
- Source File: See [authController.js](file:///e:/Downloads/BOOKLOOP/BOOKLOOP-1c2f434f30d5bdce1a1deff598afeff9a08e564b/backend/controllers/authController.js).

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React.js (Vite) | High-speed single-page application framework. |
| **3D Rendering** | Three.js & React Three Fiber | Seamless, hardware-accelerated 3D canvas and animations. |
| **Styling** | Vanilla CSS & HSL Custom Properties | Glassmorphism UI, custom micro-interactions, responsive sizing. |
| **Backend Core** | Node.js & Express.js | Secure, modular REST API controller system. |
| **Database** | PostgreSQL | Relational storage with foreign key constraints, indexes, and transactions. |
| **Security** | Bcrypt & JSON Web Tokens (JWT) | Cryptographic security layer for sessions and sensitive data. |
| **Asset Storage** | Cloudinary & Multer | Dynamic image processing, file uploading, and high-speed CDN delivery. |

---

## 📂 Project Directory Structure

```text
BOOKLOOP/
├── backend/                        # Express & PostgreSQL Logic
│   ├── config/                     # Database & Cloudinary setup
│   │   ├── db.js                   # Postgres pg-pool configuration
│   │   └── cloudinary.js           # Cloudinary SDK settings
│   ├── controllers/                # Request handling & transaction logic
│   │   ├── adminController.js      # Global stats and admin user management
│   │   ├── authController.js       # Register, login, OTP codes & profile pictures
│   │   ├── bookController.js       # Book CRUD and status moderation
│   │   ├── ratingController.js     # User review submissions and aggregations
│   │   ├── requestController.js    # Buy and barter transactions logic
│   │   └── wishlistController.js   # Match alerts query registers
│   ├── middleware/                 # Middleware protection layers
│   │   ├── auth.js                 # JWT verification
│   │   ├── role.js                 # Multi-role route guards
│   │   ├── upload.js               # Multer-Cloudinary file pipeline
│   │   └── error.js                # Centralized exception boundary
│   ├── routes/                     # Mount points for API resources
│   ├── services/                   # Notification & external utilities
│   └── index.js                    # Entry point of Express server
│
├── frontend/                       # React + Vite Application
│   ├── src/
│   │   ├── components/             # Reusable modular interfaces
│   │   │   ├── admin/              # UserCard, StatsCard, ApprovalCard, etc.
│   │   │   ├── book/               # BookCard, BookForm listing editors
│   │   │   ├── common/             # ProtectedRoute, Navbar, Footer, StarRating
│   │   │   └── home/               # R3F Canvas meshes, BookModel, HeroText
│   │   ├── context/                # Global states (AuthContext)
│   │   ├── pages/                  # Main routed page views
│   │   │   ├── Auth/               # Login, Register, ForgotPassword
│   │   │   ├── About.jsx           # Clean page highlighting project vision
│   │   │   ├── AdminDashboard.jsx  # Metrics and pending listings approvals
│   │   │   ├── BuyerDashboard.jsx  # Outgoing requests and wishlists
│   │   │   ├── Home.jsx            # Landing page hosting 3D engine canvas
│   │   │   ├── Marketplace.jsx     # Search directory with advanced filters
│   │   │   ├── Profile.jsx         # Custom locations, profile pictures update
│   │   │   └── SellerDashboard.jsx # Seller items listings management
│   │   ├── services/               # API callers mapping
│   │   └── styles/                 # Custom HSL palettes and glassmorphic designs
│   │
│   ├── vite.config.js              # Hot Module Replacement configurations
│   └── index.html                  # Core HTML5 page container
```

---

## 🗄️ Database Schema & Data Models

The relational PostgreSQL schema utilizes foreign keys, strict check constraints, and cascade delete propagation for absolute data integrity.

### 📊 Entity Relationship Diagram

```text
  +------------------+          +------------------+          +------------------+
  |      USERS       |          |      BOOKS       |          |    WISHLISTS     |
  +------------------+          +------------------+          +------------------+
  | id (PK, UUID)    |<--+      | id (PK, UUID)    |<--+      | id (PK, UUID)    |
  | name             |   |      | title            |   |      | user_id (FK) ----|--+
  | email (Unique)   |   +-----[| seller_id (FK)   |   |      | query            |  |
  | role (Constraint)|          | status (Pending) |   |      | book_id (FK)     |  |
  | location, pic    |          | class, subject   |   |      | created_at       |  |
  +------------------+          +------------------+   |      +------------------+  |
    ^                             ^          ^         |                            |
    |                             |          |         |                            |
    |                             |          |         | [offered_book]             |
    |                             |          +---------|-----+                      |
    |                             |                    |     |                      |
    |                             |                    |     |                      |
    |                             | [requested]        |     |                      |
    |                             |                    |     |                      |
    |                             |                    |     |                      |
    |                       +------------------+       |     |                      |
    |                       |    REQUESTS      |       |     |                      |
    |                       +------------------+       |     |                      |
    |                       | id (PK, UUID)    |       |     |                      |
    |                       | book_id (FK) ----|-------+     |                      |
    |                       | buyer_id (FK) ---|-------------+                      |
    |                       | status (Pending) |                                    |
    |                       | request_type     |                                    |
    |                       | offered_book (FK)|------------------------------------+
    |                       +------------------+
    |                                ^
    |                                | [rates]
    |                                |
    +--------------------------------+
                            +------------------+
                            |     RATINGS      |
                            +------------------+
                            | id (PK, UUID)    |
                            | request_id (FK)  |
                            | rating (1-5)     |
                            | comments         |
                            +------------------+
```

### 📋 Main Database Tables Description

1. **`users`**: Academic profiles representing admins, sellers, or buyers. Holds location, profile pictures, and phone statuses.
2. ****`otps`**: Hashes of codes associated with emails or telephone lines, accompanied by expiration dates and rate-limiting attempt counters.
3. **`books`**: Book titles categorized by subject, quality grade conditions (`New`, `Good`, `Worn`), pricing, array of uploaded image URLs, current status (`pending`, `approved`, `rejected`, `sold`), and geographical location tags.
4. **`requests`**: Buy or swap requests. Supports `request_type` of `'buy'` or `'swap'` linked with a potential `offered_book_id`.
5. **`ratings`**: Customer feedback. Contains ratings (integers 1 to 5) and textual explanations, tied to completed requests.
6. **`wishlists`**: Keywords or targets tracked by buyers. Used to query notifications when matching listing alerts activate.

> [!NOTE]
> Database constraints are strictly enforced in SQL. For example, rating inputs are checked in range `rating >= 1 AND rating <= 5`. Book conditions are restricted to `New`, `Good`, or `Worn`. Roles are strictly constrained via `CHECK (role IN ('admin', 'seller', 'buyer'))`.

---

## 📡 Core API Reference

### 🔐 1. Authentication Resources (`/api/auth`)

- `POST /register`: Registers a new user. Expects `name`, `email`, `password`, `role`, and `location` in JSON request body.
- `POST /login`: Initiates authentication. If credentials are correct, starts session or generates authentication OTP.
- `POST /login/verify`: Confirms active OTP for dual-verification secure sessions.
- `POST /forgot-password`: Generates reset token sent to registered email for password recovery.
- `POST /reset-password`: Processes token updates to overwrite old passwords with newly hashed ones.
- `GET /user/:id`: Retrieves user profile info (name, location, ratings and profile pic) for product viewing.
- `PUT /profile/picture` [AUTH REQUIRED]: Modifies user photo via Multer pipeline onto Cloudinary CDN.

### 📚 2. Books Catalog Resources (`/api/books`)

- `GET /`: Lists all approved books. Supports search and query filter matching for condition, class, and keywords.
- `GET /pending` [ADMIN ONLY]: Fetches pending listings waiting for verification review.
- `GET /my-books` [SELLER ONLY]: Retrieves the catalog of listings posted by the authenticated seller.
- `GET /:id`: Detailed fetch of a single listing's properties.
- `POST /` [SELLER ONLY]: Creates a new listing. Accepts multipart fields (title, price, subject, condition, class) along with up to 4 book images processed via Multer. Set to `pending` status by default.
- `PUT /:id/status` [ADMIN/SELLER]: Updates listing status (e.g. approved/rejected by Admin, or marked as sold by Seller).
- `DELETE /:id` [SELLER ONLY]: Deletes a book listing from database.

### 🔄 3. Exchange & Buy Requests (`/api/requests`)

- `POST /` [BUYER ONLY]: Creates a purchase request or peer exchange. If `request_type: 'swap'` is passed, checks and binds `offered_book_id` to trade.
- `PUT /:id/accept` [SELLER ONLY]: Accepts request, updates this status to `'accepted'`, sets all competing requests for the same book to `'rejected'`, and marks the book as `'sold'` in a single atomic database transaction.
- `GET /incoming` [SELLER ONLY]: Details all buy/swap offers sent to the seller's active library.
- `GET /my-requests` [BUYER ONLY]: Lists outgoing requests submitted by the buyer.

### 📊 4. Administrator Analytics (`/api/admin`)

- `GET /stats` [ADMIN ONLY]: Collects metrics including total users count, books, approvals, and listing distribution.
- `GET /users` [ADMIN ONLY]: Lists accounts on the platform for moderation.

### ⭐ 5. Ratings & Reviews (`/api/ratings`)

- `POST /` [AUTH REQUIRED]: Submits feedback rating (1-5 stars) and feedback comments for finished requests.
- `GET /:user_id`: Returns ratings lists, comments, and averages associated with a specific user.
- `DELETE /:id` [ADMIN ONLY]: Moderates and deletes reviews.

### 🔔 6. Alerts & Wishlists (`/api/wishlists`)

- `POST /` [AUTH REQUIRED]: Registers search alerts or bookmark IDs.
- `GET /` [AUTH REQUIRED]: Displays registered active alerts.
- `DELETE /:id` [AUTH REQUIRED]: Deletes wishlist match triggers.

---

## 🚀 Installation & Local Environment Setup

### 1. Pre-requisites & Database Initialization
Ensure you have **Node.js** (v18+) and **PostgreSQL** installed locally.

1. Connect to PostgreSQL and create a database:
   ```sql
   CREATE DATABASE bookloop;
   ```
2. Run database schemas inside the root directory to generate tables, indices, and types:
   ```bash
   psql -d bookloop -f schema.sql
   psql -d bookloop -f update_schema.sql
   ```

### 2. Backend Server Configuration
1. Navigate to the `/backend` folder:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend/` directory and populate the required parameters:
   ```env
   # Server Connection Settings
   PORT=5000
   NODE_ENV=development

   # PostgreSQL Connection Parameters
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bookloop

   # Security Cryptography Configuration
   JWT_SECRET=super_secure_jwt_session_token_key_here

   # Cloudinary Media API Setup
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Configuration (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```
4. Start the server in Development mode with hot-reloading:
   ```bash
   npm run dev
   ```

### 3. Frontend Web Client Setup
1. Open a new terminal and navigate to the `/frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure the backend endpoint is correctly configured in [api.js](file:///e:/Downloads/BOOKLOOP/BOOKLOOP-1c2f434f30d5bdce1a1deff598afeff9a08e564b/frontend/src/services/api.js):
   ```javascript
   const API = axios.create({ baseURL: 'http://localhost:5000/api' });
   ```
4. Launch the local Vite development server:
   ```bash
   npm run dev
   ```
5. Open your web browser at `http://localhost:3000` (or the default port specified in terminal output).

---

## 🎨 Global Styling System

The application styling is designed from the ground up using **Vanilla CSS**, leveraging absolute flexibility, premium visual patterns, and modern layout structures.

- **Variables System**: Standard HSL tokens defined inside [variables.css](file:///e:/Downloads/BOOKLOOP/BOOKLOOP-1c2f434f30d5bdce1a1deff598afeff9a08e564b/frontend/src/styles/variables.css) manage uniform themes, borders, and margins.
- **Glassmorphism Panels**: UI cards use frosted glass background configurations:
  ```css
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  ```
- **Micro-Animations**: Hover animations on cards and navigation buttons enhance UX.
- **CSS File Structure**:
  - `variables.css`: Global design tokens, color configurations.
  - `global.css`: Base resets, root typography rules, scrollbars.
  - `home.css`: 3D canvas alignment styles, backdrop styles.
  - `admin.css`: Metric cards grid, approvals dashboard UI, custom status tags.

---

## 📄 License
BOOKLOOP is open-source software licensed under the [MIT License](file:///e:/Downloads/BOOKLOOP/BOOKLOOP-1c2f434f30d5bdce1a1deff598afeff9a08e564b/LICENSE).

---

&copy; 2026 BOOKLOOP. Creating a sustainable academic cycle.
