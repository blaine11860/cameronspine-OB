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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Symptom logs table
export const symptomLogs = pgTable("symptom_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pregnancyId: varchar("pregnancy_id").notNull().references(() => pregnancyProfiles.id, { onDelete: "cascade" }),
  symptoms: text("symptoms").array().notNull(), // Array of symptom names
  severity: integer("severity").notNull(), // 1 = mild, 2 = moderate, 3 = severe
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// Mood logs table
export const moodLogs = pgTable("mood_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pregnancyId: varchar("pregnancy_id").notNull().references(() => pregnancyProfiles.id, { onDelete: "cascade" }),
  mood: varchar("mood").notNull(), // 'great', 'good', 'okay', 'tired', 'unwell'
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// Weight logs table
export const weightLogs = pgTable("weight_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pregnancyId: varchar("pregnancy_id").notNull().references(() => pregnancyProfiles.id, { onDelete: "cascade" }),
  weight: real("weight").notNull(),
  unit: varchar("unit").notNull().default('lbs'), // 'lbs' or 'kg'
  loggedAt: timestamp("logged_at").defaultNow(),
});

// Pregnancy milestones table
export const pregnancyMilestones = pgTable("pregnancy_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pregnancyId: varchar("pregnancy_id").notNull().references(() => pregnancyProfiles.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  week: integer("week").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pregnancyProfiles: many(pregnancyProfiles),
  symptomLogs: many(symptomLogs),
  moodLogs: many(moodLogs),
  weightLogs: many(weightLogs),
  milestones: many(pregnancyMilestones),
}));

export const pregnancyProfilesRelations = relations(pregnancyProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [pregnancyProfiles.userId],
    references: [users.id],
  }),
  symptomLogs: many(symptomLogs),
  moodLogs: many(moodLogs),
  weightLogs: many(weightLogs),
  milestones: many(pregnancyMilestones),
}));

export const symptomLogsRelations = relations(symptomLogs, ({ one }) => ({
  user: one(users, {
    fields: [symptomLogs.userId],
    references: [users.id],
  }),
  pregnancy: one(pregnancyProfiles, {
    fields: [symptomLogs.pregnancyId],
    references: [pregnancyProfiles.id],
  }),
}));

export const moodLogsRelations = relations(moodLogs, ({ one }) => ({
  user: one(users, {
    fields: [moodLogs.userId],
    references: [users.id],
  }),
  pregnancy: one(pregnancyProfiles, {
    fields: [moodLogs.pregnancyId],
    references: [pregnancyProfiles.id],
  }),
}));

export const weightLogsRelations = relations(weightLogs, ({ one }) => ({
  user: one(users, {
    fields: [weightLogs.userId],
    references: [users.id],
  }),
  pregnancy: one(pregnancyProfiles, {
    fields: [weightLogs.pregnancyId],
    references: [pregnancyProfiles.id],
  }),
}));

export const pregnancyMilestonesRelations = relations(pregnancyMilestones, ({ one }) => ({
  user: one(users, {
    fields: [pregnancyMilestones.userId],
    references: [users.id],
  }),
  pregnancy: one(pregnancyProfiles, {
    fields: [pregnancyMilestones.pregnancyId],
    references: [pregnancyProfiles.id],
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
  loggedAt: true,
});

export const insertMoodLogSchema = createInsertSchema(moodLogs).omit({
  id: true,
  loggedAt: true,
});

export const insertWeightLogSchema = createInsertSchema(weightLogs).omit({
  id: true,
  loggedAt: true,
});

export const insertMilestoneSchema = createInsertSchema(pregnancyMilestones).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type PregnancyProfile = typeof pregnancyProfiles.$inferSelect;
export type InsertPregnancyProfile = z.infer<typeof insertPregnancyProfileSchema>;
export type SymptomLog = typeof symptomLogs.$inferSelect;
export type InsertSymptomLog = z.infer<typeof insertSymptomLogSchema>;
export type MoodLog = typeof moodLogs.$inferSelect;
export type InsertMoodLog = z.infer<typeof insertMoodLogSchema>;
export type WeightLog = typeof weightLogs.$inferSelect;
export type InsertWeightLog = z.infer<typeof insertWeightLogSchema>;
export type PregnancyMilestone = typeof pregnancyMilestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
