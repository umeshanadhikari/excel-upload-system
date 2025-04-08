const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  console.log('Authorization Header:', token); // Log the full Authorization header

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: 'Access Denied' });
  }

  // Extract 'Bearer' token
  const tokenWithoutBearer = token.split(' ')[1]; // 'Bearer <token>' => '<token>'
  console.log('Extracted Token:', tokenWithoutBearer); // Log the extracted token

  if (!tokenWithoutBearer) {
    console.error('Invalid Token Format');
    return res.status(400).json({ message: 'Invalid Token Format' });
  }

  try {
    const verified = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    console.log('Verified Token Payload:', verified); // Log the decoded token payload
    req.user = verified; // Attach decoded user to request object
    next(); // Proceed to the next middleware
  } catch (err) {
    console.error('Invalid Token:', err.message); // Log the error message
    res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = authMiddleware;