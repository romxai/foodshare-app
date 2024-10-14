const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Log the decoded token for debugging
    console.log('Decoded token:', decoded);

    // Check if it's userId or id
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token structure' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'The user belonging to this token no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
