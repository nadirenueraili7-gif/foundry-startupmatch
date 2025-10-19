// API Routes and WebSocket server
import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTeamPostSchema,
  insertProjectGigSchema,
  insertStartupSchema,
  insertMessageSchema,
  updateUserProfileSchema,
} from "@shared/schema";

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'server/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'server/uploads')));

  // Auth middleware setup
  await setupAuth(app);

  // ============ AUTH ROUTES ============
  
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ============ USER ROUTES ============

  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const targetUserId = req.params.id;

      // Only allow users to update their own profile
      if (userId !== targetUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const validatedData = updateUserProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(targetUserId, {
        ...validatedData,
        skills: req.body.skills,
        interests: req.body.interests,
      });
      res.json(user);
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ============ TEAM POSTS ROUTES ============

  app.get('/api/team-posts', isAuthenticated, async (req, res) => {
    try {
      const posts = await storage.getAllTeamPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching team posts:", error);
      res.status(500).json({ message: "Failed to fetch team posts" });
    }
  });

  app.get('/api/team-posts/:id', isAuthenticated, async (req, res) => {
    try {
      const post = await storage.getTeamPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Team post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching team post:", error);
      res.status(500).json({ message: "Failed to fetch team post" });
    }
  });

  app.post('/api/team-posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTeamPostSchema.parse(req.body);
      const post = await storage.createTeamPost(userId, validatedData);
      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating team post:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create team post" });
    }
  });

  app.patch('/api/team-posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      
      // Only admins can update status
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }

      const { status } = req.body;
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const post = await storage.updateTeamPostStatus(req.params.id, status);
      res.json(post);
    } catch (error) {
      console.error("Error updating team post:", error);
      res.status(500).json({ message: "Failed to update team post" });
    }
  });

  app.delete('/api/team-posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const post = await storage.getTeamPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: "Team post not found" });
      }

      // Only the creator or admin can delete
      const user = await storage.getUser(userId);
      if (post.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteTeamPost(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team post:", error);
      res.status(500).json({ message: "Failed to delete team post" });
    }
  });

  // ============ PROJECT GIGS ROUTES ============

  app.get('/api/project-gigs', isAuthenticated, async (req, res) => {
    try {
      const gigs = await storage.getAllProjectGigs();
      res.json(gigs);
    } catch (error) {
      console.error("Error fetching project gigs:", error);
      res.status(500).json({ message: "Failed to fetch project gigs" });
    }
  });

  app.get('/api/project-gigs/:id', isAuthenticated, async (req, res) => {
    try {
      const gig = await storage.getProjectGig(req.params.id);
      if (!gig) {
        return res.status(404).json({ message: "Project gig not found" });
      }
      res.json(gig);
    } catch (error) {
      console.error("Error fetching project gig:", error);
      res.status(500).json({ message: "Failed to fetch project gig" });
    }
  });

  app.post('/api/project-gigs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertProjectGigSchema.parse(req.body);
      const gig = await storage.createProjectGig(userId, validatedData);
      res.status(201).json(gig);
    } catch (error: any) {
      console.error("Error creating project gig:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project gig" });
    }
  });

  app.patch('/api/project-gigs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      
      // Only admins can update status
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }

      const { status } = req.body;
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const gig = await storage.updateProjectGigStatus(req.params.id, status);
      res.json(gig);
    } catch (error) {
      console.error("Error updating project gig:", error);
      res.status(500).json({ message: "Failed to update project gig" });
    }
  });

  app.delete('/api/project-gigs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gig = await storage.getProjectGig(req.params.id);
      
      if (!gig) {
        return res.status(404).json({ message: "Project gig not found" });
      }

      // Only the creator or admin can delete
      const user = await storage.getUser(userId);
      if (gig.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteProjectGig(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project gig:", error);
      res.status(500).json({ message: "Failed to delete project gig" });
    }
  });

  // ============ STARTUPS ROUTES ============

  app.get('/api/startups', isAuthenticated, async (req, res) => {
    try {
      const startups = await storage.getAllStartups();
      res.json(startups);
    } catch (error) {
      console.error("Error fetching startups:", error);
      res.status(500).json({ message: "Failed to fetch startups" });
    }
  });

  app.get('/api/startups/:id', isAuthenticated, async (req, res) => {
    try {
      const startup = await storage.getStartup(req.params.id);
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }
      res.json(startup);
    } catch (error) {
      console.error("Error fetching startup:", error);
      res.status(500).json({ message: "Failed to fetch startup" });
    }
  });

  // File upload endpoint for startup images
  app.post('/api/startups', isAuthenticated, upload.fields([
    { name: 'logoFile', maxCount: 1 },
    { name: 'heroImageFile', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Build startup data from form fields
      const startupData = {
        name: req.body.name,
        oneLiner: req.body.oneLiner,
        description: req.body.description,
        stage: req.body.stage,
        linkedinUrl: req.body.linkedinUrl || undefined,
        websiteUrl: req.body.websiteUrl || undefined,
        twitterUrl: req.body.twitterUrl || undefined,
        pitchDeckUrl: req.body.pitchDeckUrl || undefined,
        milestones: req.body.milestones ? JSON.parse(req.body.milestones) : undefined,
        currentNeeds: req.body.currentNeeds ? JSON.parse(req.body.currentNeeds) : undefined,
      };

      // Add uploaded file URLs or use provided URLs
      if (files['logoFile'] && files['logoFile'][0]) {
        startupData.logoUrl = `/uploads/${files['logoFile'][0].filename}`;
      } else if (req.body.logoUrl) {
        startupData.logoUrl = req.body.logoUrl;
      }

      if (files['heroImageFile'] && files['heroImageFile'][0]) {
        startupData.heroImageUrl = `/uploads/${files['heroImageFile'][0].filename}`;
      } else if (req.body.heroImageUrl) {
        startupData.heroImageUrl = req.body.heroImageUrl;
      }

      const validatedData = insertStartupSchema.parse(startupData);
      const startup = await storage.createStartup(userId, validatedData);
      res.status(201).json(startup);
    } catch (error: any) {
      console.error("Error creating startup:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create startup" });
    }
  });

  app.patch('/api/startups/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      
      // Only admins can update status
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }

      const { status } = req.body;
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const startup = await storage.updateStartupStatus(req.params.id, status);
      res.json(startup);
    } catch (error) {
      console.error("Error updating startup:", error);
      res.status(500).json({ message: "Failed to update startup" });
    }
  });

  app.delete('/api/startups/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startup = await storage.getStartup(req.params.id);
      
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }

      // Only the creator or admin can delete
      const user = await storage.getUser(userId);
      if (startup.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteStartup(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting startup:", error);
      res.status(500).json({ message: "Failed to delete startup" });
    }
  });

  // ============ MESSAGES ROUTES ============

  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getUserMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(senderId, validatedData);
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // ============ WEBSOCKET SERVER (from javascript_websocket blueprint) ============
  // IMPORTANT: This WebSocket server is ONLY used for broadcasting real-time notifications
  // to trigger cache invalidation on clients. It does NOT create, modify, or trust any data.
  // All actual data operations (creating messages, posts, etc.) go through the authenticated
  // HTTP endpoints above. The WebSocket just broadcasts simple notification events like
  // {type: "new_message"} so clients know to refetch their data from the secure HTTP APIs.
  
  // Whitelist of allowed event types for security
  const ALLOWED_EVENT_TYPES = new Set(['new_message', 'new_post', 'new_gig', 'new_startup', 'approval_update']);
  
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Security: Only accept whitelisted event types
        if (!message.type || !ALLOWED_EVENT_TYPES.has(message.type)) {
          console.warn('WebSocket: Rejected invalid event type:', message.type);
          return;
        }
        
        console.log('Received WebSocket notification:', message.type);

        // Broadcast only the event type (no payload data for security)
        const safeNotification = { type: message.type };
        
        // Broadcast notification to all connected clients
        // Clients will then refetch data from authenticated HTTP endpoints
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(safeNotification));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
