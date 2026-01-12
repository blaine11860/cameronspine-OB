// Authentication middleware for Express
const checkAuth = (req, res, next) => {
    if (!req.session.userInfo) {
        req.isAuthenticated = false;
    } else {
        req.isAuthenticated = true;
    }
    next();
};

// Require authentication - blocks unauthenticated requests
const requireAuth = (req, res, next) => {
    if (!req.session.userInfo) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

module.exports = { checkAuth, requireAuth };
