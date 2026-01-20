ALTER TABLE `orcamentos` ADD `descricao_sinal` varchar(100) DEFAULT 'Sinal' NOT NULL;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `descricao_retirada` varchar(100) DEFAULT 'Retirada' NOT NULL;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `descricao_prazo` varchar(100) DEFAULT '30 dias' NOT NULL;