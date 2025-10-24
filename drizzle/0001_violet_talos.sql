CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int,
	`userId` int,
	`action` varchar(64) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`localId` int NOT NULL,
	`userId` int NOT NULL,
	`reportDate` timestamp NOT NULL,
	`inputType` enum('text','pdf','excel') NOT NULL,
	`rawContent` text,
	`fileUrl` text,
	`fileName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`autoScore` int,
	`finalScore` int,
	`criteriaScores` text,
	`aiSource` varchar(64),
	`isOverridden` int NOT NULL DEFAULT 0,
	`overrideReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scores_id` PRIMARY KEY(`id`),
	CONSTRAINT `scores_reportId_unique` UNIQUE(`reportId`)
);
