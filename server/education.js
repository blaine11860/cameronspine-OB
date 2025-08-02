import express from 'express';
import { supabase } from './supabaseClient.js';
import { db } from './db.ts';
import { educationalContents } from '@shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

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

// Get educational content for a specific week
router.get('/week/:week', async (req, res) => {
  try {
    const week = parseInt(req.params.week);
    const { readability = 'medium' } = req.query;

    if (isNaN(week) || week < 1 || week > 42) {
      return res.status(400).json({ error: 'Week must be between 1 and 42' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('educational_contents')
        .select('*')
        .eq('week', week)
        .eq('readability_level', readability)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback to any readability level for that week
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('educational_contents')
          .select('*')
          .eq('week', week)
          .order('created_at', { ascending: false })
          .limit(1);

        if (fallbackError) throw fallbackError;
        return res.json(fallbackData?.[0] || null);
      }

      res.json(data[0]);
    } else {
      // Use Drizzle ORM for Replit database
      const [content] = await db.select()
        .from(educationalContents)
        .where(and(
          eq(educationalContents.week, week),
          eq(educationalContents.readabilityLevel, readability)
        ))
        .limit(1);

      if (!content) {
        // Fallback to any readability level for that week
        const [fallbackContent] = await db.select()
          .from(educationalContents)
          .where(eq(educationalContents.week, week))
          .limit(1);

        return res.json(fallbackContent || null);
      }

      res.json(content);
    }
  } catch (error) {
    console.error('Error fetching educational content:', error);
    res.status(500).json({ error: 'Failed to fetch educational content' });
  }
});

// Get educational content for current gestational age
router.get('/current', authenticate, async (req, res) => {
  try {
    const { readability = 'medium' } = req.query;

    // Get user's pregnancy profile to determine current week
    let currentWeek = null;
    if (supabase) {
      const { data: profile } = await supabase
        .from('pregnancy_profiles')
        .select('estimated_gestational_age, due_date')
        .eq('user_id', req.user.id)
        .single();

      currentWeek = profile?.estimated_gestational_age || 
                   (profile?.due_date ? calculateWeeksFromDueDate(profile.due_date) : null);
    } else {
      const [profile] = await db.select()
        .from(pregnancyProfiles)
        .where(eq(pregnancyProfiles.userId, req.user.id));

      currentWeek = profile?.estimatedGestationalAge || 
                   (profile?.dueDate ? calculateWeeksFromDueDate(profile.dueDate) : null);
    }

    if (!currentWeek) {
      return res.status(404).json({ error: 'No pregnancy profile found' });
    }

    // Redirect to week-specific endpoint
    req.params.week = currentWeek.toString();
    req.query.readability = readability;
    return router.handle(req, res);
  } catch (error) {
    console.error('Error fetching current educational content:', error);
    res.status(500).json({ error: 'Failed to fetch current educational content' });
  }
});

// Get educational content timeline (multiple weeks)
router.get('/timeline', async (req, res) => {
  try {
    const { 
      startWeek = 1, 
      endWeek = 42, 
      readability = 'medium',
      limit = 10 
    } = req.query;

    const start = parseInt(startWeek);
    const end = parseInt(endWeek);
    const limitNum = parseInt(limit);

    if (supabase) {
      const { data, error } = await supabase
        .from('educational_contents')
        .select('*')
        .gte('week', start)
        .lte('week', end)
        .eq('readability_level', readability)
        .order('week', { ascending: true })
        .limit(limitNum);

      if (error) throw error;
      res.json(data || []);
    } else {
      const contents = await db.select()
        .from(educationalContents)
        .where(and(
          gte(educationalContents.week, start),
          lte(educationalContents.week, end),
          eq(educationalContents.readabilityLevel, readability)
        ))
        .limit(limitNum);

      res.json(contents);
    }
  } catch (error) {
    console.error('Error fetching educational timeline:', error);
    res.status(500).json({ error: 'Failed to fetch educational timeline' });
  }
});

// Search educational content
router.get('/search', async (req, res) => {
  try {
    const { query, readability = 'medium', limit = 10 } = req.query;

    if (!query || query.trim().length < 3) {
      return res.status(400).json({ error: 'Search query must be at least 3 characters' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('educational_contents')
        .select('*')
        .textSearch('title', query)
        .eq('readability_level', readability)
        .order('week', { ascending: true })
        .limit(parseInt(limit));

      if (error) throw error;
      res.json(data || []);
    } else {
      // Simple search implementation for Drizzle ORM
      const contents = await db.select()
        .from(educationalContents)
        .where(eq(educationalContents.readabilityLevel, readability))
        .limit(parseInt(limit));

      // Filter by search term (basic implementation)
      const filtered = contents.filter(content => 
        content.title.toLowerCase().includes(query.toLowerCase()) ||
        content.content.toLowerCase().includes(query.toLowerCase())
      );

      res.json(filtered);
    }
  } catch (error) {
    console.error('Error searching educational content:', error);
    res.status(500).json({ error: 'Failed to search educational content' });
  }
});

// Get available readability levels
router.get('/readability-levels', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('educational_contents')
        .select('readability_level')
        .order('readability_level');

      if (error) throw error;
      const levels = [...new Set(data?.map(item => item.readability_level) || [])];
      res.json(levels);
    } else {
      // Default readability levels
      res.json(['low', 'medium', 'high']);
    }
  } catch (error) {
    console.error('Error fetching readability levels:', error);
    res.status(500).json({ error: 'Failed to fetch readability levels' });
  }
});

// Helper function to calculate weeks from due date
function calculateWeeksFromDueDate(dueDate) {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  const gestationalWeeks = 40 - diffWeeks;
  return Math.max(1, Math.min(42, gestationalWeeks));
}

export default router;