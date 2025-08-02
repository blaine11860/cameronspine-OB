import express from 'express';
import { supabase } from './supabaseClient.js';

const router = express.Router();

// Request OTP (magic link / SMS)
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'OTP sent (check SMS)' });
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, token } = req.body;
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user, session: data.session });
});

// Get current user
router.get('/user', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: error.message });
  res.json(user);
});

// Sign out
router.post('/signout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    await supabase.auth.admin.signOut(token);
  }
  res.json({ message: 'Signed out successfully' });
});

export default router;