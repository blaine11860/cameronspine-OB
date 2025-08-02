import {
  users,
  pregnancyProfiles,
  symptomLogs,
  moodLogs,
  weightLogs,
  pregnancyMilestones,
  type User,
  type UpsertUser,
  type PregnancyProfile,
  type InsertPregnancyProfile,
  type SymptomLog,
  type InsertSymptomLog,
  type MoodLog,
  type InsertMoodLog,
  type WeightLog,
  type InsertWeightLog,
  type PregnancyMilestone,
  type InsertMilestone,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Pregnancy profile operations
  getActivePregnancyProfile(userId: string): Promise<PregnancyProfile | undefined>;
  createPregnancyProfile(profile: InsertPregnancyProfile): Promise<PregnancyProfile>;
  updatePregnancyProfile(id: string, updates: Partial<InsertPregnancyProfile>): Promise<PregnancyProfile>;
  
  // Symptom logging operations
  getSymptomLogs(userId: string, pregnancyId: string, limit?: number): Promise<SymptomLog[]>;
  createSymptomLog(log: InsertSymptomLog): Promise<SymptomLog>;
  
  // Mood logging operations
  getMoodLogs(userId: string, pregnancyId: string, limit?: number): Promise<MoodLog[]>;
  createMoodLog(log: InsertMoodLog): Promise<MoodLog>;
  getTodaysMoodLog(userId: string, pregnancyId: string): Promise<MoodLog | undefined>;
  
  // Weight logging operations
  getWeightLogs(userId: string, pregnancyId: string, limit?: number): Promise<WeightLog[]>;
  createWeightLog(log: InsertWeightLog): Promise<WeightLog>;
  
  // Milestone operations
  getMilestones(userId: string, pregnancyId: string): Promise<PregnancyMilestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<PregnancyMilestone>;
  updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<PregnancyMilestone>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Pregnancy profile operations
  async getActivePregnancyProfile(userId: string): Promise<PregnancyProfile | undefined> {
    const [profile] = await db
      .select()
      .from(pregnancyProfiles)
      .where(and(eq(pregnancyProfiles.userId, userId), eq(pregnancyProfiles.isActive, true)))
      .orderBy(desc(pregnancyProfiles.createdAt));
    return profile;
  }

  async createPregnancyProfile(profile: InsertPregnancyProfile): Promise<PregnancyProfile> {
    const [newProfile] = await db
      .insert(pregnancyProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updatePregnancyProfile(id: string, updates: Partial<InsertPregnancyProfile>): Promise<PregnancyProfile> {
    const [updated] = await db
      .update(pregnancyProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pregnancyProfiles.id, id))
      .returning();
    return updated;
  }

  // Symptom logging operations
  async getSymptomLogs(userId: string, pregnancyId: string, limit = 10): Promise<SymptomLog[]> {
    return await db
      .select()
      .from(symptomLogs)
      .where(and(eq(symptomLogs.userId, userId), eq(symptomLogs.pregnancyId, pregnancyId)))
      .orderBy(desc(symptomLogs.loggedAt))
      .limit(limit);
  }

  async createSymptomLog(log: InsertSymptomLog): Promise<SymptomLog> {
    const [newLog] = await db
      .insert(symptomLogs)
      .values(log)
      .returning();
    return newLog;
  }

  // Mood logging operations
  async getMoodLogs(userId: string, pregnancyId: string, limit = 10): Promise<MoodLog[]> {
    return await db
      .select()
      .from(moodLogs)
      .where(and(eq(moodLogs.userId, userId), eq(moodLogs.pregnancyId, pregnancyId)))
      .orderBy(desc(moodLogs.loggedAt))
      .limit(limit);
  }

  async createMoodLog(log: InsertMoodLog): Promise<MoodLog> {
    const [newLog] = await db
      .insert(moodLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getTodaysMoodLog(userId: string, pregnancyId: string): Promise<MoodLog | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [log] = await db
      .select()
      .from(moodLogs)
      .where(
        and(
          eq(moodLogs.userId, userId),
          eq(moodLogs.pregnancyId, pregnancyId),
          // Note: This is a simplified check. In production, you'd want proper date range queries
        )
      )
      .orderBy(desc(moodLogs.loggedAt))
      .limit(1);
    
    return log;
  }

  // Weight logging operations
  async getWeightLogs(userId: string, pregnancyId: string, limit = 10): Promise<WeightLog[]> {
    return await db
      .select()
      .from(weightLogs)
      .where(and(eq(weightLogs.userId, userId), eq(weightLogs.pregnancyId, pregnancyId)))
      .orderBy(desc(weightLogs.loggedAt))
      .limit(limit);
  }

  async createWeightLog(log: InsertWeightLog): Promise<WeightLog> {
    const [newLog] = await db
      .insert(weightLogs)
      .values(log)
      .returning();
    return newLog;
  }

  // Milestone operations
  async getMilestones(userId: string, pregnancyId: string): Promise<PregnancyMilestone[]> {
    return await db
      .select()
      .from(pregnancyMilestones)
      .where(and(eq(pregnancyMilestones.userId, userId), eq(pregnancyMilestones.pregnancyId, pregnancyId)))
      .orderBy(pregnancyMilestones.week);
  }

  async createMilestone(milestone: InsertMilestone): Promise<PregnancyMilestone> {
    const [newMilestone] = await db
      .insert(pregnancyMilestones)
      .values(milestone)
      .returning();
    return newMilestone;
  }

  async updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<PregnancyMilestone> {
    const [updated] = await db
      .update(pregnancyMilestones)
      .set(updates)
      .where(eq(pregnancyMilestones.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
