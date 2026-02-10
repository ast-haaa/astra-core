
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Simple Session Auth
  app.use(session({
    secret: 'herbtrace-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
  }));

  // === AUTH API ===
  app.post(api.auth.login.path, async (req, res) => {
    const { username, password } = req.body;
    
    // OTP is in password field, must be 6 digits for demo
    if (!password || password.length !== 6 || !/^\d+$/.test(password)) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    
    let user = await storage.getUserByUsername(username);
    
    // Create user if first time login (for demo)
    if (!user) {
      user = await storage.createUser({
        name: "Quality Analyst",
        username: username,
        password: password,
        role: "Quality Analyst",
        email: username.includes("@") ? username : undefined,
        mobile: username.includes("@") ? undefined : username,
        language: "en",
        isProfileComplete: false
      });
    }
    
    (req.session as any).userId = user.id;
    res.json(user);
  });

  // Complete profile endpoint
  app.post("/api/auth/complete-profile", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    
    const { name, state, city, area } = req.body;
    if (!name || !state || !city || !area) return res.status(400).json({ message: "All fields required" });
    
    try {
      const user = await storage.getUser(userId);
      if (!user) return res.status(401).json({ message: "User not found" });
      
      // Generate unique ID
      const uniqueId = `LAB-${String(userId).padStart(4, '0')}`;
      
      // Update user with isProfileComplete = true
      const updated = await storage.updateUser(userId, { 
        name,
        state,
        city,
        area,
        uniqueId,
        isProfileComplete: true 
      });
      
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    
    res.json(user);
  });

  // Middleware for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    next();
  };

  // === SAMPLES API ===
  app.get(api.samples.list.path, requireAuth, async (req, res) => {
    const samples = await storage.getSamples();
    res.json(samples);
  });

  app.get(api.samples.get.path, requireAuth, async (req, res) => {
    const sample = await storage.getSample(Number(req.params.id));
    if (!sample) return res.status(404).json({ message: "Sample not found" });
    res.json(sample);
  });

  app.post(api.samples.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.samples.create.input.parse(req.body);
      const sample = await storage.createSample(input);
      res.status(201).json(sample);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  app.patch(api.samples.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.samples.update.input.parse(req.body);
      const sample = await storage.updateSample(Number(req.params.id), input);
      res.json(sample);
    } catch (err) {
       return res.status(400).json({ message: "Update failed" });
    }
  });

  // === RECALLS API ===
  app.get(api.recalls.list.path, requireAuth, async (req, res) => {
    const recalls = await storage.getRecalls();
    res.json(recalls);
  });

  // === NOTIFICATIONS API ===
  app.get(api.notifications.list.path, requireAuth, async (req, res) => {
    const notifications = await storage.getNotifications((req.session as any).userId);
    res.json(notifications);
  });

  app.patch(api.notifications.markRead.path, requireAuth, async (req, res) => {
await storage.markNotificationRead();
    res.json({ success: true });
  });

  // === SEED DATA ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  // Check if samples exist to determine if we need to seed
  const existingSamples = await storage.getSamples();

if (!existingSamples || existingSamples.length === 0) {

    // Get or create the tester user
    let user = await storage.getUserByUsername("tester");
    if (!user) {
      user = await storage.createUser({
        name: "Rajesh Kumar",
        username: "tester",
        password: "password", // Simple for MVP
        role: "Quality Analyst",
        email: "rajesh@herbtrace.in",
        mobile: "+91 98765 43210",
        language: "en"
      });
    }

    // Create Samples - EXACTLY 4 herbs only: Brahmi, Ashwagandha, Tulsi, Triphala
    await storage.createSample({
      batchId: "B-2024-001",
      herbName: "Brahmi",
      status: "completed",
      temperature: "20°C",
      humidity: "50%",
      testResult: "Pass",
      remarks: "Pure and high quality",
      testedBy: user.id,
      boxId: "BOX-001",
      hubId: "HUB-001"
    });
    
    await storage.createSample({
      batchId: "B-2024-002",
      herbName: "Ashwagandha",
      status: "in_testing",
      temperature: "22°C",
      humidity: "40%",
      testedBy: user.id,
      boxId: "BOX-002",
      hubId: "HUB-001"
    });

    await storage.createSample({
      batchId: "B-2024-003",
      herbName: "Tulsi",
      status: "completed",
      temperature: "24°C",
      humidity: "45%",
      testResult: "Pass",
      remarks: "Perfect reference sample",
      testedBy: user.id,
      boxId: "BOX-003",
      hubId: "HUB-002"
    });

    await storage.createSample({
      batchId: "B-2024-004",
      herbName: "Triphala",
      status: "pending",
      temperature: "21°C",
      humidity: "48%",
      testedBy: user.id,
      boxId: "BOX-004",
      hubId: "HUB-002"
    });

    // Seed recall data - EXACTLY ONE recall for Triphala
    await storage.createRecall({
      batchId: "B-2024-004",
      herbName: "Triphala",
      severity: "high",
      status: "open",
      reason: "Moisture exceeded safe limit"
    });

    // Seed data complete
    console.log("Database seeded with sample data");
  }
}
