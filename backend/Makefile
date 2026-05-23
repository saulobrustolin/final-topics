.PHONY: help install build dev start docker-up docker-down docker-logs db-create db-drop clean test lint

# Variáveis
NODE_BIN=./node_modules/.bin
DOCKER_COMPOSE=docker compose

# Cores para output
YELLOW=\033[0;33m
GREEN=\033[0;32m
BLUE=\033[0;34m
NC=\033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo -e "$(BLUE)╔════════════════════════════════════════════════════════╗$(NC)"
	@echo -e "$(BLUE)║          API Node.js - Targets Disponíveis             ║$(NC)"
	@echo -e "$(BLUE)╚════════════════════════════════════════════════════════╝$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo -e ""
	@echo -e "$(YELLOW)Exemplos de uso:$(NC)"
	@echo -e "  make install          - instala as dependências"
	@echo -e "  make dev              - inicia em modo desenvolvimento"
	@echo -e "  make docker-up        - sobe o PostgreSQL e pgAdmin"
	@echo -e ""

install: ## Instala as dependências do npm
	@echo -e "$(YELLOW)Instalando dependências...$(NC)"
	npm install

build: ## Compila o código com Babel
	@echo -e "$(YELLOW)Compilando código...$(NC)"
	npm run build

dev: ## Inicia a API em modo desenvolvimento (com reload automático)
	@echo -e "$(YELLOW)Iniciando em modo desenvolvimento...$(NC)"
	npm run dev

start: ## Inicia a API em modo produção
	@echo -e "$(YELLOW)Iniciando API...$(NC)"
	npm start

docker-up: ## Sobe os containers Docker (PostgreSQL e pgAdmin)
	@echo -e "$(YELLOW)Iniciando containers Docker...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo -e "$(GREEN)✓ PostgreSQL: localhost:5432$(NC)"
	@echo -e "$(GREEN)✓ pgAdmin: http://localhost:8080$(NC)"

docker-down: ## Desce os containers Docker
	@echo -e "$(YELLOW)Parando containers Docker...$(NC)"
	$(DOCKER_COMPOSE) down

docker-logs: ## Mostra os logs dos containers Docker
	$(DOCKER_COMPOSE) logs -f

docker-restart: docker-down docker-up ## Reinicia os containers Docker

db-create: ## Cria o banco de dados no PostgreSQL (requer connexão Docker)
	@echo -e "$(YELLOW)Criando banco de dados 'node_api'...$(NC)"
	@docker exec -it postgres_db psql -U postgres -c "CREATE DATABASE node_api;" 2>/dev/null || true
	@echo -e "$(GREEN)✓ Banco de dados criado (ou já existe)$(NC)"

db-drop: ## Remove o banco de dados do PostgreSQL (requer conexão Docker)
	@echo -e "$(YELLOW)⚠ Removendo banco de dados 'node_api'...$(NC)"
	@docker exec -it postgres_db psql -U postgres -c "DROP DATABASE IF EXISTS node_api;" 2>/dev/null || true
	@echo -e "$(GREEN)✓ Banco de dados removido$(NC)"

db-reset: db-drop db-create ## Reseta o banco de dados (drop + create)

clean: ## Remove arquivos compilados e cache
	@echo -e "$(YELLOW)Limpando arquivos compilados...$(NC)"
	rm -rf dist/
	rm -rf node_modules/
	@echo -e "$(GREEN)✓ Limpeza concluída$(NC)"

test: ## Executa os testes
	@echo -e "$(YELLOW)Executando testes...$(NC)"
	npm test

# Aliases úteis
up: docker-up ## Alias para docker-up
down: docker-down ## Alias para docker-down
logs: docker-logs ## Alias para docker-logs
serve: dev ## Alias para dev
rebuild: clean install build ## Limpa, reinstala e compila
full-setup: install docker-up db-create ## Setup completo do projeto (instala, docker e db)

.DEFAULT_GOAL := help
