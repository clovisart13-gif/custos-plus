ALTER TABLE `empresas` ADD `tenant_id` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `fichas_custo` ADD `tenant_id` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `itens_orcamento` ADD `tenant_id` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `tenant_id` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tenant_id` int DEFAULT 1 NOT NULL;