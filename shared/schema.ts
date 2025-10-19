// Foundry StartupMatch Database Schema
// Using blueprints: javascript_log_in_with_replit, javascript_database

import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============ AUTH TABLES (Required for Replit Auth) ============

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Extended from Replit Auth blueprint
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Extended profile fields
  university: varchar("university"),
  major: varchar("major"),
  experienceLevel: varchar("experience_level"), // Beginner, Intermediate, Advanced
  bio: text("bio"),
  skills: text("skills").array(),
  interests: text("interests").array(),
  lookingFor: text("looking_for"), // What they're looking for
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ TEAM POSTS ============

export const teamPosts = pgTable("team_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  skillsNeeded: text("skills_needed").array().notNull(),
  timeCommitment: varchar("time_commitment").notNull(), // Full-time, Part-time, Flexible
  compensationType: varchar("compensation_type").notNull(), // Equity, Paid, Unpaid, TBD
  category: varchar("category").notNull(), // Engineering, Design, Marketing, Business, etc.
  status: varchar("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ PROJECT GIGS ============

export const projectGigs = pgTable("project_gigs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  deliverables: text("deliverables").notNull(),
  requiredSkills: text("required_skills").array().notNull(),
  deadline: timestamp("deadline"),
  compensation: varchar("compensation").notNull(),
  categoryTags: text("category_tags").array().notNull(), // Pricing Strategy, Market Sizing, Data Analysis, etc.
  status: varchar("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ STARTUPS ============

export const startups = pgTable("startups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id), // Creator
  name: varchar("name", { length: 200 }).notNull(),
  oneLiner: varchar("one_liner", { length: 300 }).notNull(),
  description: text("description").notNull(),
  logoUrl: varchar("logo_url"),
  heroImageUrl: varchar("hero_image_url"),
  stage: varchar("stage").notNull(), // Idea, Seed, Early, Growth
  milestones: text("milestones").array(),
  currentNeeds: text("current_needs").array(),
  founderIds: text("founder_ids").array(), // Array of user IDs
  linkedinUrl: varchar("linkedin_url"),
  websiteUrl: varchar("website_url"),
  twitterUrl: varchar("twitter_url"),
  pitchDeckUrl: varchar("pitch_deck_url"),
  status: varchar("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ MESSAGES ============

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_sender_receiver").on(table.senderId, table.receiverId),
  index("idx_created_at").on(table.createdAt),
]);

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ many }) => ({
  teamPosts: many(teamPosts),
  projectGigs: many(projectGigs),
  startups: many(startups),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const teamPostsRelations = relations(teamPosts, ({ one }) => ({
  user: one(users, {
    fields: [teamPosts.userId],
    references: [users.id],
  }),
}));

export const projectGigsRelations = relations(projectGigs, ({ one }) => ({
  user: one(users, {
    fields: [projectGigs.userId],
    references: [users.id],
  }),
}));

export const startupsRelations = relations(startups, ({ one }) => ({
  user: one(users, {
    fields: [startups.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// ============ ZOD SCHEMAS & TYPES ============

// User schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  university: true,
  major: true,
  experienceLevel: true,
  bio: true,
  skills: true,
  interests: true,
  lookingFor: true,
});

// Team Post schemas
export const insertTeamPostSchema = createInsertSchema(teamPosts).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

// Project Gig schemas
export const insertProjectGigSchema = createInsertSchema(projectGigs).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

// Startup schemas
export const insertStartupSchema = createInsertSchema(startups).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

// Message schemas
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  senderId: true,
  read: true,
  createdAt: true,
});

// TypeScript types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type InsertTeamPost = z.infer<typeof insertTeamPostSchema>;
export type TeamPost = typeof teamPosts.$inferSelect;

export type InsertProjectGig = z.infer<typeof insertProjectGigSchema>;
export type ProjectGig = typeof projectGigs.$inferSelect;

export type InsertStartup = z.infer<typeof insertStartupSchema>;
export type Startup = typeof startups.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
