const session = require('express-session');

// Session configuration for HIPAA-compliant applications
// IMPORTANT: Never use hardcoded secrets in production
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 30 * 60 * 1000, // 30 minutes max session for HIPAA compliance
        sameSite: 'strict'
    }
};

// Validate session secret exists
if (!process.env.SESSION_SECRET) {
    console.error('WARNING: SESSION_SECRET environment variable not set');
}

module.exports = sessionConfig;
