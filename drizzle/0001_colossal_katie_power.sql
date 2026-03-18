ALTER TABLE `orcamentos` ADD `observacoes` text;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `desconto_tipo` enum('percentual','valor');--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `desconto_valor` decimal(12,2) DEFAULT '0.00';