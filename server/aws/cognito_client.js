const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const app = express();

let client;

// Initialize OpenID Client
// Note: Credentials should be stored in AWS Secrets Manager or environment variables
async function initializeClient() {
    const issuer = await Issuer.discover(process.env.COGNITO_ISSUER_URL || 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_BpcgDv5qQ');
    client = new issuer.Client({
        client_id: process.env.COGNITO_CLIENT_ID,
        client_secret: process.env.COGNITO_CLIENT_SECRET,
        redirect_uris: [process.env.COGNITO_REDIRECT_URI],
        response_types: ['code']
    });
}

initializeClient().catch(console.error);

module.exports = { getClient: () => client };
