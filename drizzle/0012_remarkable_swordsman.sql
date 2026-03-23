CREATE TABLE `observacoes_predefinidas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`titulo` varchar(100) NOT NULL,
	`conteudo` text NOT NULL,
	`categoria` varchar(50) NOT NULL DEFAULT 'geral',
	`ativo` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `observacoes_predefinidas_id` PRIMARY KEY(`id`)
);
