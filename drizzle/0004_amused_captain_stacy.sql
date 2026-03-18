ALTER TABLE `orcamentos` ADD `tipo_sinal` enum('percentual','valor') DEFAULT 'percentual' NOT NULL;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `tipo_retirada` enum('percentual','valor') DEFAULT 'percentual' NOT NULL;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `tipo_prazo` enum('percentual','valor') DEFAULT 'percentual' NOT NULL;