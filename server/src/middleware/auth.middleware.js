const jwt = require('jsonwebtoken');
const { error } = require('../utils/responseHelper');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return error(res, 'Unauthorized — no token provided', 401);
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return error(res, 'Unauthorized — invalid or expired token', 401);
  }
};

module.exports = authMiddleware;