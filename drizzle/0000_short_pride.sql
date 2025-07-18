CREATE TABLE `course` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`holes` integer DEFAULT 18 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_name_unique` ON `course` (`name`);--> statement-breakpoint
CREATE TABLE `game` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playedOn` text DEFAULT (current_timestamp) NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`courseId` integer NOT NULL,
	FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `game_hole` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hole` integer DEFAULT 1 NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`gameId` integer NOT NULL,
	FOREIGN KEY (`gameId`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_hole_player` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stroke` integer DEFAULT 0 NOT NULL,
	`playerId` integer NOT NULL,
	`gameHoleId` integer NOT NULL,
	FOREIGN KEY (`playerId`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gameHoleId`) REFERENCES `game_hole`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `player` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_name_unique` ON `player` (`name`);