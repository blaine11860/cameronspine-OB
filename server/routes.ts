import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import {
  insertPregnancyProfileSchema,
  insertSymptomLogSchema,
  insertEducationalContentSchema,
  insertForumThreadSchema,
  insertForumPostSchema,
  insertMessageSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for demo purposes
  const DEMO_USER_ID = "demo-user-123";

  // Auth routes (now mock endpoints)
  app.get('/api/auth/user', (async (req: any, res) => {
    try {
      const mockUser = {
        id: DEMO_USER_ID,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
      };
      res.json(mockUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  }) as RequestHandler);

  // Pregnancy profile routes
  app.get('/api/pregnancy/profile', (async (req: any, res) => {
    try {
      const mockProfile = {
        id: "demo-profile-1",
        userId: DEMO_USER_ID,
        dueDate: "2025-05-15",
        currentWeek: 24,
        babyName: "Baby Johnson",
        isHighRisk: false,
        notes: "Everything progressing well",
        createdAt: "2024-11-01T00:00:00Z",
        updatedAt: "2025-02-02T00:00:00Z"
      };
      res.json(mockProfile);
    } catch (error) {
      console.error("Error fetching pregnancy profile:", error);
      res.status(500).json({ message: "Failed to fetch pregnancy profile" });
    }
  }) as RequestHandler);

  app.post('/api/pregnancy/profile', (async (req: any, res) => {
    try {
      const profileData = insertPregnancyProfileSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      const profile = await storage.createPregnancyProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating pregnancy profile:", error);
      res.status(500).json({ message: "Failed to create pregnancy profile" });
    }
  }) as RequestHandler);

  // Symptom logging routes
  app.get('/api/symptoms', (async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const mockSymptoms = [
        {
          id: "symptom-1",
          userId: DEMO_USER_ID,
          symptoms: { "nausea": 3, "fatigue": 4, "back_pain": 2 },
          mood_score: 7,
          notes: "Feeling better today",
          createdAt: "2025-02-02T08:00:00Z"
        },
        {
          id: "symptom-2", 
          userId: DEMO_USER_ID,
          symptoms: { "headache": 2, "fatigue": 3 },
          mood_score: 6,
          notes: "Light headache in the morning",
          createdAt: "2025-02-01T10:30:00Z"
        }
      ];
      res.json(mockSymptoms.slice(0, limit));
    } catch (error) {
      console.error("Error fetching symptom logs:", error);
      res.status(500).json({ message: "Failed to fetch symptom logs" });
    }
  }) as RequestHandler);

  app.post('/api/symptoms', (async (req: any, res) => {
    try {
      const logData = insertSymptomLogSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      const log = await storage.createSymptomLog(logData);
      res.json(log);
    } catch (error) {
      console.error("Error creating symptom log:", error);
      res.status(500).json({ message: "Failed to create symptom log" });
    }
  }) as RequestHandler);

  // Educational content routes
  app.get('/api/education', (async (req: any, res) => {
    try {
      const week = req.query.week ? parseInt(req.query.week as string) : undefined;
      const readabilityLevel = req.query.level as string;
      
      let content;
      if (week) {
        content = await storage.getEducationalContentByWeek(week, readabilityLevel);
      } else {
        content = await storage.getAllEducationalContent();
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching educational content:", error);
      res.status(500).json({ message: "Failed to fetch educational content" });
    }
  }) as RequestHandler);

  // Forum routes
  app.get('/api/forum/threads', (async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const threads = await storage.getForumThreads(limit);
      res.json(threads);
    } catch (error) {
      console.error("Error fetching forum threads:", error);
      res.status(500).json({ message: "Failed to fetch forum threads" });
    }
  }) as RequestHandler);

  app.get('/api/forum/threads/:id', (async (req: any, res) => {
    try {
      const threadId = req.params.id;
      const thread = await storage.getForumThread(threadId);
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      const posts = await storage.getForumPosts(threadId);
      res.json({ thread, posts });
    } catch (error) {
      console.error("Error fetching forum thread:", error);
      res.status(500).json({ message: "Failed to fetch forum thread" });
    }
  }) as RequestHandler);

  app.post('/api/forum/threads', (async (req: any, res) => {
    try {
      const threadData = insertForumThreadSchema.parse({
        ...req.body,
        authorId: DEMO_USER_ID
      });
      const thread = await storage.createForumThread(threadData);
      res.json(thread);
    } catch (error) {
      console.error("Error creating forum thread:", error);
      res.status(500).json({ message: "Failed to create forum thread" });
    }
  }) as RequestHandler);

  app.post('/api/forum/threads/:id/posts', (async (req: any, res) => {
    try {
      const threadId = req.params.id;
      const postData = insertForumPostSchema.parse({
        ...req.body,
        threadId,
        authorId: DEMO_USER_ID
      });
      const post = await storage.createForumPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  }) as RequestHandler);

  // Messaging routes
  app.get('/api/messages', (async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const mockMessages = [
        {
          id: "msg-1",
          fromUserId: "clinician-1",
          toUserId: DEMO_USER_ID,
          content: "How are you feeling today? Any new symptoms to report?",
          isEmergency: false,
          readAt: null,
          createdAt: "2025-02-02T09:00:00Z",
          from: { name: "Dr. Moore", isClinician: true }
        }
      ];
      res.json(mockMessages.slice(0, limit));
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  }) as RequestHandler);

  app.get('/api/messages/conversation/:userId', (async (req: any, res) => {
    try {
      const otherUserId = req.params.userId;
      const mockConversation = [
        {
          id: "msg-1",
          fromUserId: "clinician-1",
          toUserId: DEMO_USER_ID,
          content: "How are you feeling today?",
          isEmergency: false,
          readAt: "2025-02-02T09:30:00Z",
          createdAt: "2025-02-02T09:00:00Z",
          from: { name: "Dr. Moore", isClinician: true }
        }
      ];
      res.json(mockConversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  }) as RequestHandler);

  app.post('/api/messages', (async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        fromUserId: DEMO_USER_ID
      });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  }) as RequestHandler);

  app.patch('/api/messages/:id/read', (async (req: any, res) => {
    try {
      const messageId = req.params.id;
      // Mock marking message as read
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  }) as RequestHandler);

  // Mood tracking routes
  app.get('/api/mood', (async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const mockMoods = [
        { id: "mood-1", userId: DEMO_USER_ID, score: 7, notes: "Feeling good today", timestamp: "2025-02-02T08:00:00Z" },
        { id: "mood-2", userId: DEMO_USER_ID, score: 6, notes: "A bit tired", timestamp: "2025-02-01T08:00:00Z" }
      ];
      res.json(mockMoods.slice(0, limit));
    } catch (error) {
      console.error("Error fetching mood logs:", error);
      res.status(500).json({ message: "Failed to fetch mood logs" });
    }
  }) as RequestHandler);

  app.get('/api/mood/today', (async (req: any, res) => {
    try {
      const todayMood = { id: "mood-today", userId: DEMO_USER_ID, score: 7, notes: "Feeling great today", timestamp: new Date().toISOString() };
      res.json(todayMood);
    } catch (error) {
      console.error("Error fetching today's mood:", error);
      res.status(500).json({ message: "Failed to fetch today's mood" });
    }
  }) as RequestHandler);

  app.post('/api/mood', (async (req: any, res) => {
    try {
      const { score, notes, timestamp } = req.body;
      const moodLog = { id: `mood-${Date.now()}`, userId: DEMO_USER_ID, score, notes, timestamp: timestamp || new Date().toISOString() };
      res.json(moodLog);
    } catch (error) {
      console.error("Error creating mood log:", error);
      res.status(500).json({ message: "Failed to create mood log" });
    }
  }) as RequestHandler);

  // Symptom analytics route
  app.get('/api/symptoms/analytics', (async (req: any, res) => {
    try {
      const mockAnalytics = {
        symptomFrequency: { "nausea": 15, "fatigue": 20, "back_pain": 8, "headache": 5 },
        symptomAverages: { "nausea": 3.2, "fatigue": 3.8, "back_pain": 2.5, "headache": 2.1 },
        moodTrend: [
          { date: "2025-01-28", score: 6 },
          { date: "2025-01-29", score: 7 },
          { date: "2025-01-30", score: 6 },
          { date: "2025-01-31", score: 8 },
          { date: "2025-02-01", score: 6 },
          { date: "2025-02-02", score: 7 }
        ],
        totalLogs: 45,
        averageMood: 6.8
      };
      res.json(mockAnalytics);
    } catch (error) {
      console.error("Error fetching symptom analytics:", error);
      res.status(500).json({ message: "Failed to fetch symptom analytics" });
    }
  }) as RequestHandler);

  const httpServer = createServer(app);
  return httpServer;
}