CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now(),
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "recalls" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"herb_name" text NOT NULL,
	"severity" text NOT NULL,
	"status" text NOT NULL,
	"reason" text DEFAULT 'Failed lab quality test',
	"date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "samples" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"herb_name" text NOT NULL,
	"assigned_date" timestamp DEFAULT now(),
	"status" text NOT NULL,
	"temperature" text,
	"humidity" text,
	"tested_by" integer,
	"test_result" text,
	"remarks" text,
	"lab_report_url" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'Quality Analyst' NOT NULL,
	"email" text,
	"mobile" text,
	"state" text,
	"city" text,
	"area" text,
	"unique_id" text,
	"language" text DEFAULT 'en' NOT NULL,
	"username" text,
	"password" text,
	"is_profile_complete" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "samples" ADD CONSTRAINT "samples_tested_by_users_id_fk" FOREIGN KEY ("tested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;