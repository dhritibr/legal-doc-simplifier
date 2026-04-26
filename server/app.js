const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./src/middleware/error.middleware');
const { apiLimiter } = require('./src/middleware/rateLimit.middleware');

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL
    ].filter(Boolean);

    // allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    if (allowed.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

app.use('/api/auth',      require('./src/modules/auth/auth.routes'));
app.use('/api/documents', require('./src/modules/document/document.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', env: process.env.NODE_ENV }));

app.use(errorHandler);

module.exports = app;