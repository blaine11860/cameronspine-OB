import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  date,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: text("phone").unique(),
  displayName: varchar("display_name"),
  isClinician: boolean("is_clinician").default(false),
  profileCompleted: boolean("profile_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pregnancy profiles table
export const pregnancyProfiles = pgTable("pregnancy_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dueDate: date("due_date").notNull(),
  currentWeek: integer("current_week").notNull().default(1),
  babyName: varchar("baby_name"),
  isActive: boolean("is_active").notNull().default(true),
  highRiskFlags: jsonb("high_risk_flags"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Symptom logs table
export const symptomLogs = pgTable("symptom_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow(),
  symptoms: jsonb("symptoms").notNull(), // e.g., { "headache": 3, "swelling": 1 }
  moodScore: integer("mood_score"), // 1-10 scale
  notes: text("notes"),
});

// Educational content table
export const educationalContents = pgTable("educational_contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(),
  title: varchar("title").notNull(),
  bodyMarkdown: text("body_markdown").notNull(),
  readabilityLevel: varchar("readability_level").notNull(), // "low", "medium", "high"
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shared summaries table
export const sharedSummaries = pgTable("shared_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(), // secure random string
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum threads table
export const forumThreads = pgTable("forum_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  isFlagged: boolean("is_flagged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum posts (replies) table
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => forumThreads.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  isFlagged: boolean("is_flagged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUser: varchar("from_user").notNull().references(() => users.id, { onDelete: "cascade" }),
  toUser: varchar("to_user").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  readAt: timestamp("read_at"),
  isFlagged: boolean("is_flagged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pregnancyProfiles: many(pregnancyProfiles),
  symptomLogs: many(symptomLogs),
  sharedSummaries: many(sharedSummaries),
  forumThreads: many(forumThreads),
  forumPosts: many(forumPosts),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
}));

export const pregnancyProfilesRelations = relations(pregnancyProfiles, ({ one }) => ({
  user: one(users, {
    fields: [pregnancyProfiles.userId],
    references: [users.id],
  }),
}));

export const symptomLogsRelations = relations(symptomLogs, ({ one }) => ({
  user: one(users, {
    fields: [symptomLogs.userId],
    references: [users.id],
  }),
}));

export const sharedSummariesRelations = relations(sharedSummaries, ({ one }) => ({
  user: one(users, {
    fields: [sharedSummaries.userId],
    references: [users.id],
  }),
}));

export const forumThreadsRelations = relations(forumThreads, ({ one, many }) => ({
  author: one(users, {
    fields: [forumThreads.authorId],
    references: [users.id],
  }),
  posts: many(forumPosts),
}));

export const forumPostsRelations = relations(forumPosts, ({ one }) => ({
  thread: one(forumThreads, {
    fields: [forumPosts.threadId],
    references: [forumThreads.id],
  }),
  author: one(users, {
    fields: [forumPosts.authorId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUser],
    references: [users.id],
    relationName: "sentMessages",
  }),
  toUser: one(users, {
    fields: [messages.toUser],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

// Insert schemas
export const insertPregnancyProfileSchema = createInsertSchema(pregnancyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSymptomLogSchema = createInsertSchema(symptomLogs).omit({
  id: true,
  timestamp: true,
});

export const insertEducationalContentSchema = createInsertSchema(educationalContents).omit({
  id: true,
  createdAt: true,
});

export const insertSharedSummarySchema = createInsertSchema(sharedSummaries).omit({
  id: true,
  createdAt: true,
});

export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({
  id: true,
  createdAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type PregnancyProfile = typeof pregnancyProfiles.$inferSelect;
export type InsertPregnancyProfile = z.infer<typeof insertPregnancyProfileSchema>;

export type SymptomLog = typeof symptomLogs.$inferSelect;
export type InsertSymptomLog = z.infer<typeof insertSymptomLogSchema>;

export type EducationalContent = typeof educationalContents.$inferSelect;
export type InsertEducationalContent = z.infer<typeof insertEducationalContentSchema>;

export type SharedSummary = typeof sharedSummaries.$inferSelect;
export type InsertSharedSummary = z.infer<typeof insertSharedSummarySchema>;

export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
