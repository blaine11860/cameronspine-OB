import express from 'express';
import dayjs from 'dayjs';
import { supabase } from './supabaseClient.js';

const router = express.Router();

// Middleware to check if Supabase is configured
const requireSupabase = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: 'Supabase not configured. Using fallback Replit auth system.' 
    });
  }
  next();
};

router.get('/', requireSupabase, async (req, res) => {
  // Expect Authorization: Bearer <supabase_access_token>
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Missing token');

  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid user' });

  // Fetch pregnancy profile
  const { data: profile, error: profErr } = await supabase
    .from('pregnancy_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profErr) return res.status(404).json({ error: 'Profile not found' });

  const dueDate = dayjs(profile.due_date);
  const today = dayjs();
  const gestAgeWeeks = Math.floor(today.diff(dueDate.subtract(40, 'week'), 'day') / 7);
  const daysUntilDue = dueDate.diff(today, 'day');

  res.json({
    dueDate: dueDate.format('YYYY-MM-DD'),
    gestationalAgeWeeks: gestAgeWeeks,
    daysUntilDue,
    highRiskFlags: profile.high_risk_flags,
  });
});

// Create or update pregnancy profile
router.post('/', requireSupabase, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Missing token');

  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) return res.status(401).json({ error: 'Invalid user' });

  const { due_date, baby_name, high_risk_flags } = req.body;

  const { data: profile, error } = await supabase
    .from('pregnancy_profiles')
    .upsert({
      user_id: user.id,
      due_date,
      baby_name,
      high_risk_flags: high_risk_flags || {},
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(profile);
});

export default router;