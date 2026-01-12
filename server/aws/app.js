const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const sessionConfig = require('./session_config');
const { checkAuth, requireAuth } = require('./auth_middleware');

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(session(sessionConfig));

let client;

// Initialize OpenID Client
async function initializeClient() {
    const issuer = await Issuer.discover(process.env.COGNITO_ISSUER_URL);
    client = new issuer.Client({
        client_id: process.env.COGNITO_CLIENT_ID,
        client_secret: process.env.COGNITO_CLIENT_SECRET,
        redirect_uris: [process.env.COGNITO_REDIRECT_URI],
        response_types: ['code']
    });
}
initializeClient().catch(console.error);

// Home route
app.get('/', checkAuth, (req, res) => {
    res.render('home', {
        isAuthenticated: req.isAuthenticated,
        userInfo: req.session.userInfo
    });
});

// Login route
app.get('/login', (req, res) => {
    const nonce = generators.nonce();
    const state = generators.state();

    req.session.nonce = nonce;
    req.session.state = state;

    const authUrl = client.authorizationUrl({
        scope: 'phone openid email',
        state: state,
        nonce: nonce,
    });

    res.redirect(authUrl);
});

// Callback route
app.get('/callback', async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            process.env.COGNITO_REDIRECT_URI,
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;
        req.session.tokenSet = tokenSet;

        res.redirect('/');
    } catch (err) {
        console.error('Callback error:', err);
        res.status(500).send('Authentication failed');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    const logoutUrl = `${process.env.COGNITO_DOMAIN}/logout?` +
        `client_id=${process.env.COGNITO_CLIENT_ID}&` +
        `logout_uri=${encodeURIComponent(process.env.COGNITO_LOGOUT_REDIRECT_URI)}`;
    res.redirect(logoutUrl);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
