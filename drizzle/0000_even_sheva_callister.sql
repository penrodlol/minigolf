CREATE TABLE `course` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`holes` integer DEFAULT 18 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_name_unique` ON `course` (`name`);--> statement-breakpoint
CREATE TABLE `game` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gameDate` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`courseId` integer NOT NULL,
	FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `hole` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hole` integer NOT NULL,
	`stroke` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`gameId` integer NOT NULL,
	`playerId` integer NOT NULL,
	FOREIGN KEY (`gameId`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`playerId`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_name_unique` ON `player` (`name`);