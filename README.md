# 🔄 BOOKLOOP

### *Circular Marketplace for Academic Resources*

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-PERN-blue)
![Date](https://img.shields.io/badge/Updated-March%2029%2C%202026-orange)

**BOOKLOOP** is a high-performance, full-stack marketplace designed for students to buy, sell, and exchange academic materials. Focused on sustainability and real-time interaction, it bridges the gap between academic needs and resource longevity.

---

## ✨ Core Features

- **💬 Real-Time Messaging**: Instant peer-to-peer communication powered by **Socket.io**.
- **🎨 Premium UI/UX**: A minimalist, sleek interface featuring **Glassmorphism** and intentional design.
- **📦 3D Interactive Hero**: A stunning immersive experience built with **React Three Fiber** and **Three.js**.
- **🛡️ Secure Auth System**: Multi-role authentication (Admin, Seller, Buyer) with secure JWT sessions.
- **📋 Management Dashboards**: dedicated controls for listing approvals, chat history, and ratings.
- **☁️ Cloud-Powered Assets**: Seamless image handling via **Cloudinary**.

---

## 🛠️ Technology Stack

- **Frontend**: [React.js](https://reactjs.org/) (Vite), [Three.js](https://threejs.org/), Vanilla CSS, [Axios](https://axios-http.com/).
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [Socket.io](https://socket.io/).
- **Database**: [PostgreSQL](https://www.postgresql.org/) (PERN).
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt.
- **Storage**: Cloudinary (Cloud-based asset management).

---

## 🚀 Quick Setup

### 1. Prerequisites
- **PostgreSQL** installed and running.
- **Cloudinary** account for image uploads.

### 2. Database Initialization
1. Create a database named `bookloop`.
2. Execute the `schema.sql` file:
   ```bash
   psql -d bookloop -f schema.sql
   ```

### 3. Backend Configuration
1. Navigate to `backend/`.
2. Configure your `.env` with:
   - `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `CLOUDINARY_URL`.
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

### 4. Frontend Launch
1. Navigate to `frontend/`.
2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000`.

---

## 📂 Project Architecture

```text
BOOKLOOP/
├── backend/            # Express, Socket.io, & PostgreSQL Logic
│   ├── config/         # Database & Cloudinary Connection
│   ├── controllers/    # Request handling & Business logic
│   ├── services/       # Email & Helper services
│   └── index.js        # Server entry point
└── frontend/           # React + Vite Application
    ├── src/
    │   ├── components/ # Atomic UI & 3D Components
    │   ├── pages/      # Dashboards & Dynamic Views
    │   └── context/    # Global State Management
```

---

## 📄 License
Released under the [MIT License](LICENSE).

&copy; 2026 BOOKLOOP. Creating a sustainable academic cycle.
