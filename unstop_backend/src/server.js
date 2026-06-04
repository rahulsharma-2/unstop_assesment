const express = require('express');
const cors = require('cors');
const {
  bookRooms,
  getState,
  randomizeOccupancy,
  resetBookings
} = require('./bookingService');

const app = express();
const PORT = process.env.PORT || 6001;
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/rooms', (req, res) => {
  res.json(getState());
});

app.post('/api/book', (req, res, next) => {
  try {
    res.json(bookRooms(req.body.count));
  } catch (error) {
    next(error);
  }
});

app.post('/api/randomize', (req, res) => {
  res.json(randomizeOccupancy());
});

app.post('/api/reset', (req, res) => {
  res.json(resetBookings());
});

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    message: error.message || 'Something went wrong.'
  });
});

app.listen(PORT, () => {
  console.log(`Hotel reservation API running on http://localhost:${PORT}`);
});
