CREATE TABLE `empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cnpj` varchar(20),
	`email` varchar(100),
	`telefone` varchar(20),
	`endereco` varchar(255),
	`cidade` varchar(100),
	`estado` varchar(2),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `empresas_id` PRIMARY KEY(`id`)
);
