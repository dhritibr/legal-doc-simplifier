const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./src/middleware/error.middleware');
const { apiLimiter } = require('./src/middleware/rateLimit.middleware');

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.CLIENT_URL],
  credentials: true
}));;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

app.use('/api/auth',      require('./src/modules/auth/auth.routes'));
app.use('/api/documents', require('./src/modules/document/document.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', env: process.env.NODE_ENV }));

app.use(errorHandler);

module.exports = app;