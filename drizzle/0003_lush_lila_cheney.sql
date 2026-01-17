CREATE TABLE `itens_orcamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orcamento_id` int NOT NULL,
	`ficha_id` int NOT NULL,
	`referencia` varchar(100) NOT NULL,
	`descricao` text NOT NULL,
	`quantidade` int NOT NULL,
	`custo` decimal(12,2) NOT NULL,
	`valor_unitario` decimal(12,2) NOT NULL,
	`valor_total` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `itens_orcamento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`nome_cliente` varchar(100) NOT NULL,
	`marca` varchar(100) NOT NULL,
	`numero_orcamento` varchar(50) NOT NULL,
	`data_emissao` timestamp NOT NULL DEFAULT (now()),
	`validade` int NOT NULL DEFAULT 30,
	`prazo_dias` int NOT NULL DEFAULT 30,
	`total_pecas` int NOT NULL DEFAULT 0,
	`subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
	`total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`percentual_sinal` decimal(5,2) NOT NULL DEFAULT '25.00',
	`percentual_retirada` decimal(5,2) NOT NULL DEFAULT '25.00',
	`percentual_prazo` decimal(5,2) NOT NULL DEFAULT '50.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamentos_id` PRIMARY KEY(`id`),
	CONSTRAINT `orcamentos_numero_orcamento_unique` UNIQUE(`numero_orcamento`)
);
