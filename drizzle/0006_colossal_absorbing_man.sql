CREATE TABLE `course_company` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_company_name_unique` ON `course_company` (`name`);--> statement-breakpoint
ALTER TABLE `course` ADD `companyId` integer NOT NULL REFERENCES course_company(id);