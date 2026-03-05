CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`is_synced` integer DEFAULT false,
	`updated_at` integer
);
