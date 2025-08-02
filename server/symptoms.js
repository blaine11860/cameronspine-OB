import express from 'express';
import { supabase } from './supabaseClient.js';
import { db } from './db.ts';
import { symptomLogs, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Middleware to check authentication (Supabase or Replit fallback)
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (supabase && token) {
    // Supabase authentication
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: user.id, phone: user.phone };
  } else if (req.isAuthenticated && req.isAuthenticated()) {
    // Replit authentication fallback
    req.user = { id: req.user.claims.sub };
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Log symptoms with JSONB structure
router.post('/', authenticate, async (req, res) => {
  try {
    const { symptoms, mood_score, notes } = req.body;
    
    // Validate JSONB symptoms structure (e.g., {"headache": 3, "swelling": 1})
    if (symptoms && typeof symptoms !== 'object') {
      return res.status(400).json({ error: 'Symptoms must be a valid JSON object' });
    }
    
    if (mood_score && (mood_score < 1 || mood_score > 10)) {
      return res.status(400).json({ error: 'Mood score must be between 1 and 10' });
    }

    if (supabase) {
      // Use Supabase client for direct database operations
      const { data, error } = await supabase.from('symptom_logs').insert({
        user_id: req.user.id,
        timestamp: new Date().toISOString(),
        symptoms: symptoms || {},
        mood_score: mood_score || null,
        notes: notes || '',
      }).select().single();

      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } else {
      // Use Drizzle ORM for Replit database
      const [symptomLog] = await db.insert(symptomLogs).values({
        userId: req.user.id,
        timestamp: new Date(),
        symptoms: symptoms || {},
        moodScore: mood_score || null,
        notes: notes || '',
      }).returning();

      res.json(symptomLog);
    }
  } catch (error) {
    console.error('Error logging symptoms:', error);
    res.status(500).json({ error: 'Failed to log symptoms' });
  }
});

// Get symptom logs for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    if (supabase) {
      const { data, error } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', req.user.id)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } else {
      const logs = await db.select()
        .from(symptomLogs)
        .where(eq(symptomLogs.userId, req.user.id))
        .orderBy(symptomLogs.timestamp)
        .limit(parseInt(limit))
        .offset(parseInt(offset));

      res.json(logs);
    }
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    res.status(500).json({ error: 'Failed to fetch symptoms' });
  }
});

// Get symptom analytics/summary
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    if (supabase) {
      const { data, error } = await supabase
        .from('symptom_logs')
        .select('symptoms, mood_score, timestamp')
        .eq('user_id', req.user.id)
        .gte('timestamp', startDate.toISOString());

      if (error) return res.status(400).json({ error: error.message });
      
      // Process analytics
      const analytics = processSymptomAnalytics(data);
      res.json(analytics);
    } else {
      const logs = await db.select({
        symptoms: symptomLogs.symptoms,
        moodScore: symptomLogs.moodScore,
        timestamp: symptomLogs.timestamp,
      })
        .from(symptomLogs)
        .where(eq(symptomLogs.userId, req.user.id));

      const analytics = processSymptomAnalytics(logs);
      res.json(analytics);
    }
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Helper function to process symptom analytics
function processSymptomAnalytics(logs) {
  const symptomFrequency = {};
  const moodTrend = [];
  const symptomSeverity = {};

  logs.forEach(log => {
    // Process symptoms JSONB data
    if (log.symptoms) {
      Object.entries(log.symptoms).forEach(([symptom, severity]) => {
        if (!symptomFrequency[symptom]) {
          symptomFrequency[symptom] = 0;
          symptomSeverity[symptom] = [];
        }
        symptomFrequency[symptom]++;
        symptomSeverity[symptom].push(severity);
      });
    }

    // Process mood data
    if (log.mood_score || log.moodScore) {
      moodTrend.push({
        date: log.timestamp,
        score: log.mood_score || log.moodScore
      });
    }
  });

  // Calculate average severity for each symptom
  const symptomAverages = {};
  Object.entries(symptomSeverity).forEach(([symptom, severities]) => {
    symptomAverages[symptom] = severities.reduce((sum, val) => sum + val, 0) / severities.length;
  });

  return {
    symptomFrequency,
    symptomAverages,
    moodTrend: moodTrend.sort((a, b) => new Date(a.date) - new Date(b.date)),
    totalLogs: logs.length,
    averageMood: moodTrend.length > 0 
      ? moodTrend.reduce((sum, entry) => sum + entry.score, 0) / moodTrend.length 
      : null
  };
}

export default router;