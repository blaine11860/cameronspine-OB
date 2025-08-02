import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  }) as RequestHandler);

  // Pregnancy profile routes
  app.get('/api/pregnancy/profile', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getActivePregnancyProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching pregnancy profile:", error);
      res.status(500).json({ message: "Failed to fetch pregnancy profile" });
    }
  }) as RequestHandler);

  app.post('/api/pregnancy/profile', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertPregnancyProfileSchema.parse({
        ...req.body,
        userId
      });
      const profile = await storage.createPregnancyProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating pregnancy profile:", error);
      res.status(500).json({ message: "Failed to create pregnancy profile" });
    }
  }) as RequestHandler);

  // Symptom logging routes
  app.get('/api/symptoms', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const logs = await storage.getSymptomLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching symptom logs:", error);
      res.status(500).json({ message: "Failed to fetch symptom logs" });
    }
  }) as RequestHandler);

  app.post('/api/symptoms', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logData = insertSymptomLogSchema.parse({
        ...req.body,
        userId
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

  app.post('/api/forum/threads', isAuthenticated, (async (req: any, res) => {
    try {
      const authorId = req.user.claims.sub;
      const threadData = insertForumThreadSchema.parse({
        ...req.body,
        authorId
      });
      const thread = await storage.createForumThread(threadData);
      res.json(thread);
    } catch (error) {
      console.error("Error creating forum thread:", error);
      res.status(500).json({ message: "Failed to create forum thread" });
    }
  }) as RequestHandler);

  app.post('/api/forum/threads/:id/posts', isAuthenticated, (async (req: any, res) => {
    try {
      const threadId = req.params.id;
      const authorId = req.user.claims.sub;
      const postData = insertForumPostSchema.parse({
        ...req.body,
        threadId,
        authorId
      });
      const post = await storage.createForumPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  }) as RequestHandler);

  // Messaging routes
  app.get('/api/messages', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const messages = await storage.getMessages(userId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  }) as RequestHandler);

  app.get('/api/messages/conversation/:userId', isAuthenticated, (async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      const conversation = await storage.getConversation(currentUserId, otherUserId);
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  }) as RequestHandler);

  app.post('/api/messages', isAuthenticated, (async (req: any, res) => {
    try {
      const fromUser = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        fromUser
      });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  }) as RequestHandler);

  app.patch('/api/messages/:id/read', isAuthenticated, (async (req: any, res) => {
    try {
      const messageId = req.params.id;
      await storage.markMessageAsRead(messageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  }) as RequestHandler);

  const httpServer = createServer(app);
  return httpServer;
}