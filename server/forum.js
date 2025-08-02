import express from 'express';
import { supabase } from './supabaseClient.js';
import { db } from './db.ts';
import { forumThreads, forumPosts } from '@shared/schema';
import { eq, desc, and, ilike, sql } from 'drizzle-orm';

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

// Get all forum threads with pagination
router.get('/threads', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (supabase) {
      let query = supabase
        .from('forum_threads')
        .select(`
          *,
          author:users!forum_threads_author_id_fkey(id, first_name, last_name, profile_image_url),
          posts:forum_posts(count)
        `)
        .order('updated_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%, content.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      res.json(data || []);
    } else {
      // Use Drizzle ORM for Replit database
      let whereConditions = [];
      
      if (category) {
        whereConditions.push(eq(forumThreads.category, category));
      }

      if (search) {
        whereConditions.push(
          sql`${forumThreads.title} ILIKE ${'%' + search + '%'} OR ${forumThreads.content} ILIKE ${'%' + search + '%'}`
        );
      }

      const threads = await db.select({
        id: forumThreads.id,
        title: forumThreads.title,
        content: forumThreads.content,
        category: forumThreads.category,
        authorId: forumThreads.authorId,
        isPinned: forumThreads.isPinned,
        isLocked: forumThreads.isLocked,
        createdAt: forumThreads.createdAt,
        updatedAt: forumThreads.updatedAt,
      })
      .from(forumThreads)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(forumThreads.updatedAt))
      .limit(parseInt(limit))
      .offset(offset);

      res.json(threads);
    }
  } catch (error) {
    console.error('Error fetching forum threads:', error);
    res.status(500).json({ error: 'Failed to fetch forum threads' });
  }
});

// Get a specific thread with posts
router.get('/threads/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (supabase) {
      // Get thread details
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads')
        .select(`
          *,
          author:users!forum_threads_author_id_fkey(id, first_name, last_name, profile_image_url)
        `)
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;

      // Get posts for this thread
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:users!forum_posts_author_id_fkey(id, first_name, last_name, profile_image_url)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .range(offset, offset + parseInt(limit) - 1);

      if (postsError) throw postsError;

      res.json({
        thread,
        posts: posts || [],
        hasMore: posts && posts.length === parseInt(limit)
      });
    } else {
      // Use Drizzle ORM
      const [thread] = await db.select()
        .from(forumThreads)
        .where(eq(forumThreads.id, threadId));

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      const posts = await db.select()
        .from(forumPosts)
        .where(eq(forumPosts.threadId, threadId))
        .limit(parseInt(limit))
        .offset(offset);

      res.json({
        thread,
        posts,
        hasMore: posts.length === parseInt(limit)
      });
    }
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

// Create a new forum thread
router.post('/threads', authenticate, async (req, res) => {
  try {
    const { title, content, category = 'general' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (title.length < 5 || title.length > 200) {
      return res.status(400).json({ error: 'Title must be between 5 and 200 characters' });
    }

    if (content.length < 10) {
      return res.status(400).json({ error: 'Content must be at least 10 characters' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('forum_threads')
        .insert({
          title,
          content,
          category,
          author_id: req.user.id,
        })
        .select(`
          *,
          author:users!forum_threads_author_id_fkey(id, first_name, last_name, profile_image_url)
        `)
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } else {
      const [thread] = await db.insert(forumThreads)
        .values({
          title,
          content,
          category,
          authorId: req.user.id,
        })
        .returning();

      res.status(201).json(thread);
    }
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

// Create a new post in a thread
router.post('/threads/:threadId/posts', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content } = req.body;

    if (!content || content.length < 5) {
      return res.status(400).json({ error: 'Content must be at least 5 characters' });
    }

    if (supabase) {
      // Check if thread exists and is not locked
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads')
        .select('id, is_locked')
        .eq('id', threadId)
        .single();

      if (threadError || !thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      if (thread.is_locked) {
        return res.status(403).json({ error: 'Thread is locked' });
      }

      // Create the post
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          content,
          author_id: req.user.id,
        })
        .select(`
          *,
          author:users!forum_posts_author_id_fkey(id, first_name, last_name, profile_image_url)
        `)
        .single();

      if (error) throw error;

      // Update thread's updated_at timestamp
      await supabase
        .from('forum_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

      res.status(201).json(data);
    } else {
      // Check if thread exists using Drizzle
      const [thread] = await db.select()
        .from(forumThreads)
        .where(eq(forumThreads.id, threadId));

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      if (thread.isLocked) {
        return res.status(403).json({ error: 'Thread is locked' });
      }

      const [post] = await db.insert(forumPosts)
        .values({
          threadId,
          content,
          authorId: req.user.id,
        })
        .returning();

      // Update thread timestamp
      await db.update(forumThreads)
        .set({ updatedAt: new Date() })
        .where(eq(forumThreads.id, threadId));

      res.status(201).json(post);
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get forum categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'general', name: 'General Discussion', description: 'General pregnancy topics and chat' },
      { id: 'first_trimester', name: 'First Trimester', description: 'Weeks 1-12 experiences and questions' },
      { id: 'second_trimester', name: 'Second Trimester', description: 'Weeks 13-27 discussions' },
      { id: 'third_trimester', name: 'Third Trimester', description: 'Weeks 28-40+ and birth preparation' },
      { id: 'symptoms', name: 'Symptoms & Health', description: 'Share and discuss pregnancy symptoms' },
      { id: 'nutrition', name: 'Nutrition & Wellness', description: 'Healthy eating and exercise during pregnancy' },
      { id: 'birth_prep', name: 'Birth Preparation', description: 'Labor, delivery, and birth plans' },
      { id: 'postpartum', name: 'Postpartum', description: 'Life after baby arrives' },
      { id: 'support', name: 'Support & Encouragement', description: 'Emotional support and encouragement' },
      { id: 'announcements', name: 'Announcements', description: 'Important updates and news' },
    ];

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get trending/popular threads
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    if (supabase) {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          author:users!forum_threads_author_id_fkey(id, first_name, last_name, profile_image_url),
          posts:forum_posts(count)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('updated_at', { ascending: false })
        .limit(parseInt(limit));

      if (error) throw error;
      res.json(data || []);
    } else {
      // Simple trending logic for Drizzle
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const threads = await db.select()
        .from(forumThreads)
        .where(sql`${forumThreads.createdAt} >= ${weekAgo}`)
        .orderBy(desc(forumThreads.updatedAt))
        .limit(parseInt(limit));

      res.json(threads);
    }
  } catch (error) {
    console.error('Error fetching trending threads:', error);
    res.status(500).json({ error: 'Failed to fetch trending threads' });
  }
});

export default router;