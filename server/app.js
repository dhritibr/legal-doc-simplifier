const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./src/middleware/error.middleware');
const { apiLimiter } = require('./src/middleware/rateLimit.middleware');

const app = express();

// CORS must be first before everything
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://legal-doc-simplifier-1-rwei.onrender.com',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight for all routes

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

app.use('/api/auth',      require('./src/modules/auth/auth.routes'));
app.use('/api/documents', require('./src/modules/document/document.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', env: process.env.NODE_ENV }));

app.use(errorHandler);

module.exports = app;