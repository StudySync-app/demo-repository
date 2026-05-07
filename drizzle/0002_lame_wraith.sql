CREATE TABLE `content_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_type` text,
	`content_id` integer,
	`tag_id` integer
);
--> statement-breakpoint
CREATE TABLE `folders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`created_at` text DEFAULT '2026-05-07T03:09:37.983Z'
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`uri` text,
	`type` text,
	`folder_id` integer,
	`synced` integer DEFAULT false,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`content` text,
	`folder_id` integer,
	`synced` integer DEFAULT false,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo',
	`priority` text DEFAULT 'normal',
	`due_date` text,
	`completed` integer DEFAULT false,
	`folder_id` integer,
	`synced` integer DEFAULT false,
	`created_at` text
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "title", "description", "status", "priority", "due_date", "completed", "folder_id", "synced", "created_at") SELECT "id", "title", "description", "status", "priority", "due_date", "completed", "folder_id", "synced", "created_at" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;