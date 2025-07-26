PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_course` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`holes` integer DEFAULT 18 NOT NULL,
	`location` text NOT NULL,
	`courseCompanyId` integer NOT NULL,
	FOREIGN KEY (`courseCompanyId`) REFERENCES `course_company`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_course`("id", "name", "holes", "location", "courseCompanyId") SELECT "id", "name", "holes", "location", "courseCompanyId" FROM `course`;--> statement-breakpoint
DROP TABLE `course`;--> statement-breakpoint
ALTER TABLE `__new_course` RENAME TO `course`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `course_name_unique` ON `course` (`name`);