// Storage layer with DatabaseStorage implementation
import {
  users,
  teamPosts,
  projectGigs,
  startups,
  messages,
  type User,
  type UpsertUser,
  type UpdateUserProfile,
  type TeamPost,
  type InsertTeamPost,
  type ProjectGig,
  type InsertProjectGig,
  type Startup,
  type InsertStartup,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, or, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserProfile(id: string, data: UpdateUserProfile & { skills?: string[], interests?: string[] }): Promise<User>;
  
  // Team Posts
  getAllTeamPosts(): Promise<TeamPost[]>;
  getTeamPost(id: string): Promise<TeamPost | undefined>;
  createTeamPost(userId: string, data: InsertTeamPost): Promise<TeamPost>;
  updateTeamPostStatus(id: string, status: string): Promise<TeamPost>;
  deleteTeamPost(id: string): Promise<void>;
  
  // Project Gigs
  getAllProjectGigs(): Promise<ProjectGig[]>;
  getProjectGig(id: string): Promise<ProjectGig | undefined>;
  createProjectGig(userId: string, data: InsertProjectGig): Promise<ProjectGig>;
  updateProjectGigStatus(id: string, status: string): Promise<ProjectGig>;
  deleteProjectGig(id: string): Promise<void>;
  
  // Startups
  getAllStartups(): Promise<Startup[]>;
  getStartup(id: string): Promise<Startup | undefined>;
  createStartup(userId: string, data: InsertStartup): Promise<Startup>;
  updateStartupStatus(id: string, status: string): Promise<Startup>;
  deleteStartup(id: string): Promise<void>;
  
  // Messages
  getAllMessages(): Promise<Message[]>;
  getUserMessages(userId: string): Promise<Message[]>;
  createMessage(senderId: string, data: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<void>;
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserProfile(id: string, data: UpdateUserProfile & { skills?: string[], interests?: string[] }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Team Posts
  async getAllTeamPosts(): Promise<TeamPost[]> {
    return await db.select().from(teamPosts).orderBy(desc(teamPosts.createdAt));
  }

  async getTeamPost(id: string): Promise<TeamPost | undefined> {
    const [post] = await db.select().from(teamPosts).where(eq(teamPosts.id, id));
    return post;
  }

  async createTeamPost(userId: string, data: InsertTeamPost): Promise<TeamPost> {
    const [post] = await db
      .insert(teamPosts)
      .values({ ...data, userId })
      .returning();
    return post;
  }

  async updateTeamPostStatus(id: string, status: string): Promise<TeamPost> {
    const [post] = await db
      .update(teamPosts)
      .set({ status, updatedAt: new Date() })
      .where(eq(teamPosts.id, id))
      .returning();
    return post;
  }

  async deleteTeamPost(id: string): Promise<void> {
    await db.delete(teamPosts).where(eq(teamPosts.id, id));
  }

  // Project Gigs
  async getAllProjectGigs(): Promise<ProjectGig[]> {
    return await db.select().from(projectGigs).orderBy(desc(projectGigs.createdAt));
  }

  async getProjectGig(id: string): Promise<ProjectGig | undefined> {
    const [gig] = await db.select().from(projectGigs).where(eq(projectGigs.id, id));
    return gig;
  }

  async createProjectGig(userId: string, data: InsertProjectGig): Promise<ProjectGig> {
    const [gig] = await db
      .insert(projectGigs)
      .values({ ...data, userId })
      .returning();
    return gig;
  }

  async updateProjectGigStatus(id: string, status: string): Promise<ProjectGig> {
    const [gig] = await db
      .update(projectGigs)
      .set({ status, updatedAt: new Date() })
      .where(eq(projectGigs.id, id))
      .returning();
    return gig;
  }

  async deleteProjectGig(id: string): Promise<void> {
    await db.delete(projectGigs).where(eq(projectGigs.id, id));
  }

  // Startups
  async getAllStartups(): Promise<Startup[]> {
    return await db.select().from(startups).orderBy(desc(startups.createdAt));
  }

  async getStartup(id: string): Promise<Startup | undefined> {
    const [startup] = await db.select().from(startups).where(eq(startups.id, id));
    return startup;
  }

  async createStartup(userId: string, data: InsertStartup): Promise<Startup> {
    const [startup] = await db
      .insert(startups)
      .values({ ...data, userId })
      .returning();
    return startup;
  }

  async updateStartupStatus(id: string, status: string): Promise<Startup> {
    const [startup] = await db
      .update(startups)
      .set({ status, updatedAt: new Date() })
      .where(eq(startups.id, id))
      .returning();
    return startup;
  }

  async deleteStartup(id: string): Promise<void> {
    await db.delete(startups).where(eq(startups.id, id));
  }

  // Messages
  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getUserMessages(userId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(senderId: string, data: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({ ...data, senderId })
      .returning();
    return message;
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, id));
  }
}

export const storage = new DatabaseStorage();
