DROP TABLE `empresas`;--> statement-breakpoint
DROP TABLE `fichas_custo`;--> statement-breakpoint
DROP TABLE `itens_orcamento`;--> statement-breakpoint
DROP TABLE `orcamentos`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password_hash`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `tenant_id`;