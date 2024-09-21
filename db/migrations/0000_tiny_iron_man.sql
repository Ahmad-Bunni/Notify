CREATE TABLE `companies` (
	`id` text NOT NULL,
	`company` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text NOT NULL,
	`company` text NOT NULL,
	`villa` text,
	`telephone` text,
	`subscription` integer NOT NULL,
	`subscription_date` text NOT NULL,
	`renewal_date` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL
);
