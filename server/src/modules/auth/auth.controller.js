const jwt = require('jsonwebtoken');
const User = require('./auth.model');
const { success, error } = require('../../utils/responseHelper');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const register = async (req, res) => {
  try {
    const { name, email, password, preferredLanguage } = req.body;

    if (!name || !email || !password)
      return error(res, 'Name, email and password are required', 400);

    if (password.length < 8)
      return error(res, 'Password must be at least 8 characters', 400);

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return error(res, 'Email already registered', 409);

    const user = await User.create({
      name,
      email,
      password,
      preferredLanguage: preferredLanguage || 'english'
    });

    const token = generateToken(user._id);

    return success(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage
      }
    }, 'Account created successfully', 201);

  } catch (err) {
    return error(res, err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return error(res, 'Email and password are required', 400);

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return error(res, 'Invalid email or password', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return error(res, 'Invalid email or password', 401);

    const token = generateToken(user._id);

    return success(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        documentsProcessed: user.documentsProcessed
      }
    }, 'Login successful');

  } catch (err) {
    return error(res, err.message);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404);
    return success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      documentsProcessed: user.documentsProcessed,
      createdAt: user.createdAt
    });
  } catch (err) {
    return error(res, err.message);
  }
};

const updateLanguage = async (req, res) => {
  try {
    const { preferredLanguage } = req.body;
    const validLanguages = ['english','hindi','kannada','tamil','telugu','malayalam','marathi','bengali'];
    if (!validLanguages.includes(preferredLanguage))
      return error(res, 'Invalid language selection', 400);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferredLanguage },
      { new: true }
    );
    return success(res, { preferredLanguage: user.preferredLanguage }, 'Language updated');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { register, login, getMe, updateLanguage };