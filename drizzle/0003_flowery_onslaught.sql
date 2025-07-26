PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_course` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`holes` integer DEFAULT 18 NOT NULL,
	`companyId` integer,
	FOREIGN KEY (`companyId`) REFERENCES `course_company`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_course`("id", "name", "holes", "companyId") SELECT "id", "name", "holes", "companyId" FROM `course`;--> statement-breakpoint
DROP TABLE `course`;--> statement-breakpoint
ALTER TABLE `__new_course` RENAME TO `course`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `course_name_unique` ON `course` (`name`);--> statement-breakpoint
CREATE TABLE `__new_game` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playedOn` text DEFAULT (current_timestamp) NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`courseId` integer,
	FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_game`("id", "playedOn", "completed", "courseId") SELECT "id", "playedOn", "completed", "courseId" FROM `game`;--> statement-breakpoint
DROP TABLE `game`;--> statement-breakpoint
ALTER TABLE `__new_game` RENAME TO `game`;--> statement-breakpoint
CREATE TABLE `__new_game_hole` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hole` integer DEFAULT 1 NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`gameId` integer,
	FOREIGN KEY (`gameId`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_game_hole`("id", "hole", "completed", "gameId") SELECT "id", "hole", "completed", "gameId" FROM `game_hole`;--> statement-breakpoint
DROP TABLE `game_hole`;--> statement-breakpoint
ALTER TABLE `__new_game_hole` RENAME TO `game_hole`;--> statement-breakpoint
CREATE TABLE `__new_game_hole_player` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stroke` integer DEFAULT 0 NOT NULL,
	`playerId` integer,
	`gameHoleId` integer,
	FOREIGN KEY (`playerId`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gameHoleId`) REFERENCES `game_hole`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_game_hole_player`("id", "stroke", "playerId", "gameHoleId") SELECT "id", "stroke", "playerId", "gameHoleId" FROM `game_hole_player`;--> statement-breakpoint
DROP TABLE `game_hole_player`;--> statement-breakpoint
ALTER TABLE `__new_game_hole_player` RENAME TO `game_hole_player`;