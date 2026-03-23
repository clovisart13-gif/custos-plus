ALTER TABLE `users` DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `empresas` DROP COLUMN `tenant_id`;--> statement-breakpoint
ALTER TABLE `fichas_custo` DROP COLUMN `tenant_id`;--> statement-breakpoint
ALTER TABLE `itens_orcamento` DROP COLUMN `tenant_id`;--> statement-breakpoint
ALTER TABLE `orcamentos` DROP COLUMN `tenant_id`;--> statement-breakpoint
ALTER TABLE `orcamentos` DROP COLUMN `tipo_sinal`;--> statement-breakpoint
ALTER TABLE `orcamentos` DROP COLUMN `tipo_retirada`;--> statement-breakpoint
ALTER TABLE `orcamentos` DROP COLUMN `tipo_prazo`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password_hash`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `tenant_id`;