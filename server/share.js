import express from 'express';
import crypto from 'crypto';
import { supabase } from './supabaseClient.js';
import { db } from './db.ts';
import { sharedSummaries, pregnancyProfiles, symptomLogs, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

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

// Create a secure share token for pregnancy data
router.post('/create', authenticate, async (req, res) => {
  try {
    const { duration = 7 } = req.body; // Duration in days, default 7 days
    
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * duration);

    if (supabase) {
      // Use Supabase client for direct database operations
      const { data, error } = await supabase.from('shared_summaries').insert({
        user_id: req.user.id,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      }).select().single();

      if (error) return res.status(400).json({ error: error.message });
      
      res.json({ 
        share_url: `/api/share/${token}`,
        token,
        expires_at: expiresAt.toISOString(),
        duration_days: duration
      });
    } else {
      // Use Drizzle ORM for Replit database
      const [shareRecord] = await db.insert(sharedSummaries).values({
        userId: req.user.id,
        token,
        expiresAt,
        createdAt: new Date(),
      }).returning();

      res.json({ 
        share_url: `/api/share/${token}`,
        token,
        expires_at: expiresAt.toISOString(),
        duration_days: duration
      });
    }
  } catch (error) {
    console.error('Error creating share token:', error);
    res.status(500).json({ error: 'Failed to create share token' });
  }
});

// Get user's active share tokens
router.get('/tokens', authenticate, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('shared_summaries')
        .select('token, expires_at, created_at')
        .eq('user_id', req.user.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } else {
      const tokens = await db.select({
        token: sharedSummaries.token,
        expiresAt: sharedSummaries.expiresAt,
        createdAt: sharedSummaries.createdAt,
      })
        .from(sharedSummaries)
        .where(and(
          eq(sharedSummaries.userId, req.user.id),
          // Only return non-expired tokens
        ))
        .orderBy(desc(sharedSummaries.createdAt));

      // Filter out expired tokens
      const activeTokens = tokens.filter(token => new Date(token.expiresAt) > new Date());
      res.json(activeTokens);
    }
  } catch (error) {
    console.error('Error fetching share tokens:', error);
    res.status(500).json({ error: 'Failed to fetch share tokens' });
  }
});

// Revoke a share token
router.delete('/tokens/:token', authenticate, async (req, res) => {
  try {
    const { token } = req.params;

    if (supabase) {
      const { error } = await supabase
        .from('shared_summaries')
        .delete()
        .eq('token', token)
        .eq('user_id', req.user.id);

      if (error) return res.status(400).json({ error: error.message });
    } else {
      await db.delete(sharedSummaries)
        .where(and(
          eq(sharedSummaries.token, token),
          eq(sharedSummaries.userId, req.user.id)
        ));
    }

    res.json({ message: 'Share token revoked successfully' });
  } catch (error) {
    console.error('Error revoking share token:', error);
    res.status(500).json({ error: 'Failed to revoke share token' });
  }
});

// Public endpoint to view shared pregnancy summary (no authentication required)
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (supabase) {
      // Check if token exists and is valid
      const { data: record, error } = await supabase
        .from('shared_summaries')
        .select('user_id, expires_at, created_at')
        .eq('token', token)
        .single();

      if (error || !record) {
        return res.status(404).json({ error: 'Share link not found' });
      }

      if (new Date(record.expires_at) < new Date()) {
        return res.status(410).json({ error: 'Share link has expired' });
      }

      // Fetch user profile
      const { data: user } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', record.user_id)
        .single();

      // Fetch pregnancy profile
      const { data: profile } = await supabase
        .from('pregnancy_profiles')
        .select('*')
        .eq('user_id', record.user_id)
        .single();

      // Fetch recent symptom logs (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: symptoms } = await supabase
        .from('symptom_logs')
        .select('timestamp, symptoms, mood_score, notes')
        .eq('user_id', record.user_id)
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: false });

      res.json({
        user: {
          name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Anonymous',
          email: user?.email,
        },
        profile,
        recent_symptoms: symptoms || [],
        share_info: {
          created_at: record.created_at,
          expires_at: record.expires_at,
        }
      });
    } else {
      // Use Drizzle ORM for Replit database
      const [record] = await db.select()
        .from(sharedSummaries)
        .where(eq(sharedSummaries.token, token));

      if (!record) {
        return res.status(404).json({ error: 'Share link not found' });
      }

      if (new Date(record.expiresAt) < new Date()) {
        return res.status(410).json({ error: 'Share link has expired' });
      }

      // Fetch user data
      const [user] = await db.select({
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
        .from(users)
        .where(eq(users.id, record.userId));

      // Fetch pregnancy profile
      const [profile] = await db.select()
        .from(pregnancyProfiles)
        .where(eq(pregnancyProfiles.userId, record.userId));

      // Fetch recent symptom logs (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const symptoms = await db.select({
        timestamp: symptomLogs.timestamp,
        symptoms: symptomLogs.symptoms,
        moodScore: symptomLogs.moodScore,
        notes: symptomLogs.notes,
      })
        .from(symptomLogs)
        .where(eq(symptomLogs.userId, record.userId))
        .orderBy(desc(symptomLogs.timestamp));

      res.json({
        user: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous',
          email: user?.email,
        },
        profile,
        recent_symptoms: symptoms || [],
        share_info: {
          created_at: record.createdAt,
          expires_at: record.expiresAt,
        }
      });
    }
  } catch (error) {
    console.error('Error fetching shared summary:', error);
    res.status(500).json({ error: 'Failed to fetch shared summary' });
  }
});

// Analytics endpoint for shared data (public, no auth required)
router.get('/:token/analytics', async (req, res) => {
  try {
    const { token } = req.params;
    
    // First verify the token is valid
    let userId;
    if (supabase) {
      const { data: record, error } = await supabase
        .from('shared_summaries')
        .select('user_id, expires_at')
        .eq('token', token)
        .single();

      if (error || !record || new Date(record.expires_at) < new Date()) {
        return res.status(404).json({ error: 'Invalid or expired share link' });
      }
      userId = record.user_id;
    } else {
      const [record] = await db.select()
        .from(sharedSummaries)
        .where(eq(sharedSummaries.token, token));

      if (!record || new Date(record.expiresAt) < new Date()) {
        return res.status(404).json({ error: 'Invalid or expired share link' });
      }
      userId = record.userId;
    }

    // Generate analytics for the shared data
    let symptoms;
    if (supabase) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data } = await supabase
        .from('symptom_logs')
        .select('symptoms, mood_score, timestamp')
        .eq('user_id', userId)
        .gte('timestamp', thirtyDaysAgo.toISOString());
      
      symptoms = data || [];
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      symptoms = await db.select({
        symptoms: symptomLogs.symptoms,
        moodScore: symptomLogs.moodScore,
        timestamp: symptomLogs.timestamp,
      })
        .from(symptomLogs)
        .where(eq(symptomLogs.userId, userId));
    }

    // Process analytics similar to symptoms.js
    const analytics = processSymptomAnalytics(symptoms);
    res.json(analytics);
  } catch (error) {
    console.error('Error generating shared analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Helper function to process symptom analytics (reused from symptoms.js)
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
      : null,
    dateRange: {
      from: logs.length > 0 ? Math.min(...logs.map(l => new Date(l.timestamp).getTime())) : null,
      to: logs.length > 0 ? Math.max(...logs.map(l => new Date(l.timestamp).getTime())) : null,
    }
  };
}

export default router;