const express = require('express');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middleware/error');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const requestRoutes = require('./routes/requestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ratingRoutes = require('./routes/ratings');

const http = require('http');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(server);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('BOOKLOOP API is running');
});

app.use(errorHandler);

const db = require('./config/db');

db.pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL');
  release();
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
