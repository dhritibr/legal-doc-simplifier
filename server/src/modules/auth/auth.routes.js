const router = require('express').Router();
const { register, login, getMe, updateLanguage } = require('./auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.post('/register',         register);
router.post('/login',            login);
router.get('/me',                authMiddleware, getMe);
router.patch('/language',        authMiddleware, updateLanguage);

module.exports = router;