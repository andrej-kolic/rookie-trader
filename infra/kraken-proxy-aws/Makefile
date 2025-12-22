.PHONY: help validate deploy-infra deploy-update outputs setup-oidc clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

validate: ## Validate CloudFormation templates
	@./scripts/deploy.sh validate

deploy-infra: ## Deploy infrastructure stack
	@./scripts/deploy.sh infra

deploy-update: ## Update Lambda function code
	@./scripts/deploy.sh update

outputs: ## Display stack outputs
	@./scripts/deploy.sh outputs

setup-oidc: ## Setup GitHub OIDC authentication (one-time)
	@./scripts/oidc.sh

clean: ## Clean build artifacts
	@rm -rf dist/ lambda/ *.zip packaged.template deploy_output.json
	@echo "Cleaned build artifacts"
