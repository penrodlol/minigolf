PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_game_hole_player` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stroke` integer DEFAULT 0 NOT NULL,
	`playerId` integer NOT NULL,
	`gameHoleId` integer NOT NULL,
	FOREIGN KEY (`playerId`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gameHoleId`) REFERENCES `game_hole`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_game_hole_player`("id", "stroke", "playerId", "gameHoleId") SELECT "id", "stroke", "playerId", "gameHoleId" FROM `game_hole_player`;--> statement-breakpoint
DROP TABLE `game_hole_player`;--> statement-breakpoint
ALTER TABLE `__new_game_hole_player` RENAME TO `game_hole_player`;--> statement-breakpoint
PRAGMA foreign_keys=ON;