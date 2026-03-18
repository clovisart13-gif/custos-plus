CREATE TABLE `empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int NOT NULL DEFAULT 1,
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
--> statement-breakpoint
CREATE TABLE `fichas_custo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int NOT NULL DEFAULT 1,
	`user_id` int NOT NULL,
	`referencia` varchar(100) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`familia` varchar(50) NOT NULL,
	`cliente` varchar(100) NOT NULL,
	`foto_url` text,
	`modelagem` decimal(10,2) NOT NULL DEFAULT '0.00',
	`piloto` decimal(10,2) NOT NULL DEFAULT '0.00',
	`corte` decimal(10,2) NOT NULL DEFAULT '0.00',
	`beneficiamento` decimal(10,2) NOT NULL DEFAULT '0.00',
	`costura` decimal(10,2) NOT NULL DEFAULT '0.00',
	`lavanderia` decimal(10,2) NOT NULL DEFAULT '0.00',
	`acabamento` decimal(10,2) NOT NULL DEFAULT '0.00',
	`passadoria` decimal(10,2) NOT NULL DEFAULT '0.00',
	`tecido` decimal(10,2) NOT NULL DEFAULT '0.00',
	`aviamento` decimal(10,2) NOT NULL DEFAULT '0.00',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fichas_custo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itens_orcamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int NOT NULL DEFAULT 1,
	`orcamento_id` int NOT NULL,
	`ficha_id` int NOT NULL,
	`referencia` varchar(100) NOT NULL,
	`descricao` text NOT NULL,
	`quantidade` int NOT NULL,
	`custo` decimal(12,2) NOT NULL,
	`valor_unitario` decimal(12,2) NOT NULL,
	`valor_total` decimal(12,2) NOT NULL,
	`markup_divisor` decimal(4,2) NOT NULL DEFAULT '0.50',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `itens_orcamento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int NOT NULL DEFAULT 1,
	`user_id` int NOT NULL,
	`nome_cliente` varchar(100) NOT NULL,
	`marca` varchar(100) NOT NULL,
	`numero_orcamento` varchar(50) NOT NULL,
	`data_emissao` timestamp NOT NULL DEFAULT (now()),
	`validade` int NOT NULL DEFAULT 30,
	`prazo_dias` int NOT NULL DEFAULT 30,
	`prazo_entrega_texto` varchar(255) NOT NULL DEFAULT '30 dias',
	`total_pecas` int NOT NULL DEFAULT 0,
	`subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
	`total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`percentual_sinal` decimal(5,2) NOT NULL DEFAULT '25.00',
	`descricao_sinal` varchar(100) NOT NULL DEFAULT 'Sinal',
	`tipo_sinal` enum('percentual','valor') NOT NULL DEFAULT 'percentual',
	`percentual_retirada` decimal(5,2) NOT NULL DEFAULT '25.00',
	`descricao_retirada` varchar(100) NOT NULL DEFAULT 'Retirada',
	`tipo_retirada` enum('percentual','valor') NOT NULL DEFAULT 'percentual',
	`percentual_prazo` decimal(5,2) NOT NULL DEFAULT '50.00',
	`descricao_prazo` varchar(100) NOT NULL DEFAULT '30 dias',
	`tipo_prazo` enum('percentual','valor') NOT NULL DEFAULT 'percentual',
	`status` enum('pendente','aprovado','reprovado') NOT NULL DEFAULT 'pendente',
	`enviado` tinyint NOT NULL DEFAULT 0,
	`observacoes` text,
	`desconto_tipo` enum('percentual','valor'),
	`desconto_valor` decimal(12,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamentos_id` PRIMARY KEY(`id`),
	CONSTRAINT `orcamentos_numero_orcamento_unique` UNIQUE(`numero_orcamento`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','production') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `password_hash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `tenant_id` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);