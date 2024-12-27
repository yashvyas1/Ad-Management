import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Forbidden request: Token is missing' });
    }

    try {
      const decoded = await verifyToken(token);

      if (decoded.role === 'advertiser') {
        req.advertiser = decoded;
      } else if (decoded.role === 'publisher') {
        req.publisher = decoded;
      } else if (decoded.role === 'admin') {
        req.admin = decoded;
      } else {
        return res.status(401).json({ message: 'Unauthorized: Invalid role' });
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token is invalid' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      } else {
        return res.status(500).json({ message: 'Server error', error: error.message });
      }
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized user: No token provided' });
  }
});
export default validateToken