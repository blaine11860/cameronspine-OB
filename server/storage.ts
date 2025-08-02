import {
  users,
  pregnancyProfiles,
  symptomLogs,
  educationalContents,
  sharedSummaries,
  forumThreads,
  forumPosts,
  messages,
  type User,
  type UpsertUser,
  type PregnancyProfile,
  type InsertPregnancyProfile,
  type SymptomLog,
  type InsertSymptomLog,
  type EducationalContent,
  type InsertEducationalContent,
  type SharedSummary,
  type InsertSharedSummary,
  type ForumThread,
  type InsertForumThread,
  type ForumPost,
  type InsertForumPost,
  type Message,
  type InsertMessage,
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
  getSymptomLogs(userId: string, limit?: number): Promise<SymptomLog[]>;
  createSymptomLog(log: InsertSymptomLog): Promise<SymptomLog>;
  
  // Educational content operations
  getEducationalContentByWeek(week: number, readabilityLevel?: string): Promise<EducationalContent[]>;
  getAllEducationalContent(): Promise<EducationalContent[]>;
  createEducationalContent(content: InsertEducationalContent): Promise<EducationalContent>;
  
  // Shared summaries operations
  createSharedSummary(summary: InsertSharedSummary): Promise<SharedSummary>;
  getSharedSummaryByToken(token: string): Promise<SharedSummary | undefined>;
  
  // Forum operations
  getForumThreads(limit?: number): Promise<ForumThread[]>;
  getForumThread(id: string): Promise<ForumThread | undefined>;
  createForumThread(thread: InsertForumThread): Promise<ForumThread>;
  getForumPosts(threadId: string): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  
  // Messaging operations
  getMessages(userId: string, limit?: number): Promise<Message[]>;
  getConversation(userId: string, otherUserId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<void>;
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
  async getSymptomLogs(userId: string, limit = 10): Promise<SymptomLog[]> {
    return await db
      .select()
      .from(symptomLogs)
      .where(eq(symptomLogs.userId, userId))
      .orderBy(desc(symptomLogs.timestamp))
      .limit(limit);
  }

  async createSymptomLog(log: InsertSymptomLog): Promise<SymptomLog> {
    const [newLog] = await db
      .insert(symptomLogs)
      .values(log)
      .returning();
    return newLog;
  }

  // Educational content operations
  async getEducationalContentByWeek(week: number, readabilityLevel?: string): Promise<EducationalContent[]> {
    let query = db
      .select()
      .from(educationalContents)
      .where(eq(educationalContents.week, week));
    
    if (readabilityLevel) {
      query = query.where(eq(educationalContents.readabilityLevel, readabilityLevel));
    }
    
    return await query.orderBy(educationalContents.createdAt);
  }

  async getAllEducationalContent(): Promise<EducationalContent[]> {
    return await db
      .select()
      .from(educationalContents)
      .orderBy(educationalContents.week, educationalContents.createdAt);
  }

  async createEducationalContent(content: InsertEducationalContent): Promise<EducationalContent> {
    const [newContent] = await db
      .insert(educationalContents)
      .values(content)
      .returning();
    return newContent;
  }

  // Shared summaries operations
  async createSharedSummary(summary: InsertSharedSummary): Promise<SharedSummary> {
    const [newSummary] = await db
      .insert(sharedSummaries)
      .values(summary)
      .returning();
    return newSummary;
  }

  async getSharedSummaryByToken(token: string): Promise<SharedSummary | undefined> {
    const [summary] = await db
      .select()
      .from(sharedSummaries)
      .where(eq(sharedSummaries.token, token));
    return summary;
  }

  // Forum operations
  async getForumThreads(limit = 20): Promise<ForumThread[]> {
    return await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.isFlagged, false))
      .orderBy(desc(forumThreads.createdAt))
      .limit(limit);
  }

  async getForumThread(id: string): Promise<ForumThread | undefined> {
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, id));
    return thread;
  }

  async createForumThread(thread: InsertForumThread): Promise<ForumThread> {
    const [newThread] = await db
      .insert(forumThreads)
      .values(thread)
      .returning();
    return newThread;
  }

  async getForumPosts(threadId: string): Promise<ForumPost[]> {
    return await db
      .select()
      .from(forumPosts)
      .where(and(eq(forumPosts.threadId, threadId), eq(forumPosts.isFlagged, false)))
      .orderBy(forumPosts.createdAt);
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db
      .insert(forumPosts)
      .values(post)
      .returning();
    return newPost;
  }

  // Messaging operations
  async getMessages(userId: string, limit = 20): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(and(
        eq(messages.toUser, userId),
        eq(messages.isFlagged, false)
      ))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.isFlagged, false),
          // Messages between the two users in either direction
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(eq(messages.id, messageId));
  }
}

export const storage = new DatabaseStorage();
