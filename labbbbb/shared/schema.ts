
import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").default("Quality Analyst").notNull(),
  email: text("email"),
  mobile: text("mobile"),
  state: text("state"),
  city: text("city"),
  area: text("area"),
  uniqueId: text("unique_id"),
  language: text("language").default("en").notNull(), // en, hi, mr, gu
  username: text("username").unique(), // Phone or Email
  password: text("password"), // For OTP verification (can be empty)
  isProfileComplete: boolean("is_profile_complete").default(false).notNull(),
});

export const samples = pgTable("samples", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  herbName: text("herb_name").notNull(),
  assignedDate: timestamp("assigned_date").defaultNow(),
  status: text("status").notNull(), // pending, in_testing, completed, rejected
  // IoT Data simulation
  temperature: text("temperature"),
  humidity: text("humidity"),
  testedBy: integer("tested_by").references(() => users.id),
  // Lab Report fields
  testResult: text("test_result"), // Pass, Fail, Requires Retest
  remarks: text("remarks"),
  labReportUrl: text("lab_report_url"),
  // Source tracking
  boxId: text("box_id"),
  hubId: text("hub_id"),
});

export const recalls = pgTable("recalls", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  herbName: text("herb_name").notNull(),
  severity: text("severity").notNull(), // high, warning, info
  status: text("status").notNull(), // open, resolved
  reason: text("reason").default("Failed lab quality test"),
  date: timestamp("date").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // assignment, status_change, recall, iot_alert
  message: text("message").notNull(),
  read: boolean("read").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

// === RELATIONS ===
export const samplesRelations = relations(samples, ({ one }) => ({
  tester: one(users, {
    fields: [samples.testedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// === INSERT SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertSampleSchema = createInsertSchema(samples).omit({ id: true, assignedDate: true });
export const insertRecallSchema = createInsertSchema(recalls).omit({ id: true, date: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, timestamp: true, read: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Sample = typeof samples.$inferSelect;
export type InsertSample = z.infer<typeof insertSampleSchema>;

export type Recall = typeof recalls.$inferSelect;
export type InsertRecall = z.infer<typeof insertRecallSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// === API CONTRACT TYPES ===
export type CreateSampleRequest = InsertSample;
export type UpdateSampleRequest = Partial<InsertSample>;

export type CreateRecallRequest = InsertRecall;
export type UpdateRecallRequest = Partial<InsertRecall>;
