const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        // Get the Authorization header
        const authHeader = req.headers.authorization;
        
        // Check if Authorization header exists and starts with 'Bearer '
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided or invalid format.'
            });
        }
        
        // Extract token from 'Bearer <token>'
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request object
        req.user = decoded;
        
        // Continue
        next();
        
    } catch (error) {
        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired.'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Token verification failed.'
            });
        }
    }
};

module.exports = verifyToken;
