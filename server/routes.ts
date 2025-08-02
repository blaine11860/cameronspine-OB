import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertPregnancyProfileSchema,
  insertSymptomLogSchema,
  insertMoodLogSchema,
  insertWeightLogSchema,
  insertMilestoneSchema,
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
        userId,
      });
      
      const profile = await storage.createPregnancyProfile(profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid pregnancy profile data", errors: error.errors });
      } else {
        console.error("Error creating pregnancy profile:", error);
        res.status(500).json({ message: "Failed to create pregnancy profile" });
      }
    }
  }) as RequestHandler);

  // Symptom logging routes
  app.get('/api/symptoms', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pregnancyId = req.query.pregnancyId as string;
      
      if (!pregnancyId) {
        res.status(400).json({ message: "Pregnancy ID is required" });
        return;
      }
      
      const symptoms = await storage.getSymptomLogs(userId, pregnancyId);
      res.json(symptoms);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  }) as RequestHandler);

  app.post('/api/symptoms', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logData = insertSymptomLogSchema.parse({
        ...req.body,
        userId,
      });
      
      const log = await storage.createSymptomLog(logData);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid symptom log data", errors: error.errors });
      } else {
        console.error("Error creating symptom log:", error);
        res.status(500).json({ message: "Failed to create symptom log" });
      }
    }
  }) as RequestHandler);

  // Mood logging routes
  app.get('/api/mood', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pregnancyId = req.query.pregnancyId as string;
      
      if (!pregnancyId) {
        res.status(400).json({ message: "Pregnancy ID is required" });
        return;
      }
      
      const moods = await storage.getMoodLogs(userId, pregnancyId);
      res.json(moods);
    } catch (error) {
      console.error("Error fetching mood logs:", error);
      res.status(500).json({ message: "Failed to fetch mood logs" });
    }
  }) as RequestHandler);

  app.get('/api/mood/today', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pregnancyId = req.query.pregnancyId as string;
      
      if (!pregnancyId) {
        res.status(400).json({ message: "Pregnancy ID is required" });
        return;
      }
      
      const todaysMood = await storage.getTodaysMoodLog(userId, pregnancyId);
      res.json(todaysMood);
    } catch (error) {
      console.error("Error fetching today's mood:", error);
      res.status(500).json({ message: "Failed to fetch today's mood" });
    }
  }) as RequestHandler);

  app.post('/api/mood', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logData = insertMoodLogSchema.parse({
        ...req.body,
        userId,
      });
      
      const log = await storage.createMoodLog(logData);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid mood log data", errors: error.errors });
      } else {
        console.error("Error creating mood log:", error);
        res.status(500).json({ message: "Failed to create mood log" });
      }
    }
  }) as RequestHandler);

  // Weight logging routes
  app.get('/api/weight', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pregnancyId = req.query.pregnancyId as string;
      
      if (!pregnancyId) {
        res.status(400).json({ message: "Pregnancy ID is required" });
        return;
      }
      
      const weights = await storage.getWeightLogs(userId, pregnancyId);
      res.json(weights);
    } catch (error) {
      console.error("Error fetching weight logs:", error);
      res.status(500).json({ message: "Failed to fetch weight logs" });
    }
  }) as RequestHandler);

  app.post('/api/weight', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logData = insertWeightLogSchema.parse({
        ...req.body,
        userId,
      });
      
      const log = await storage.createWeightLog(logData);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid weight log data", errors: error.errors });
      } else {
        console.error("Error creating weight log:", error);
        res.status(500).json({ message: "Failed to create weight log" });
      }
    }
  }) as RequestHandler);

  // Milestone routes
  app.get('/api/milestones', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pregnancyId = req.query.pregnancyId as string;
      
      if (!pregnancyId) {
        res.status(400).json({ message: "Pregnancy ID is required" });
        return;
      }
      
      const milestones = await storage.getMilestones(userId, pregnancyId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  }) as RequestHandler);

  app.post('/api/milestones', isAuthenticated, (async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const milestoneData = insertMilestoneSchema.parse({
        ...req.body,
        userId,
      });
      
      const milestone = await storage.createMilestone(milestoneData);
      res.json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      } else {
        console.error("Error creating milestone:", error);
        res.status(500).json({ message: "Failed to create milestone" });
      }
    }
  }) as RequestHandler);

  app.patch('/api/milestones/:id', isAuthenticated, (async (req: any, res) => {
    try {
      const milestoneId = req.params.id;
      const updates = req.body;
      
      const milestone = await storage.updateMilestone(milestoneId, updates);
      res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Failed to update milestone" });
    }
  }) as RequestHandler);

  const httpServer = createServer(app);
  return httpServer;
}
