ALTER TABLE `fichas_custo` MODIFY COLUMN `tipo` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `fichas_custo` MODIFY COLUMN `familia` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `fichas_custo` MODIFY COLUMN `cliente` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `fichas_custo` ADD `foto_url` text;