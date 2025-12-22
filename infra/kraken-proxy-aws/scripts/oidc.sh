#!/usr/bin/env bash
#
# Setup GitHub OIDC authentication for AWS deployments
#
# This script creates (or reuses) an OIDC identity provider and IAM role
# that allows GitHub Actions to deploy to AWS without storing credentials.
#

set -euo pipefail

# shellcheck source=./helpers.sh
source "$(dirname "$0")/helpers.sh"

# Constants
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly CONFIG_FILE="${PROJECT_DIR}/deploy-config.json"
readonly OIDC_TEMPLATE="${PROJECT_DIR}/templates/github-oidc.yaml"

#
# Load configuration
#
load_config() {
  if [[ ! -f "${CONFIG_FILE}" ]]; then
    error "Configuration file not found: ${CONFIG_FILE}"
    exit 1
  fi

  PROJECT_NAME=$(jq -r '.project_name' "${CONFIG_FILE}")
  REGION=$(jq -r '.region' "${CONFIG_FILE}")
  GITHUB_ORG=$(jq -r '.oidc.github_org' "${CONFIG_FILE}")
  GITHUB_REPO=$(jq -r '.oidc.github_repo' "${CONFIG_FILE}")
  PROVIDER_ARN=$(jq -r '.oidc.provider_arn // empty' "${CONFIG_FILE}")
  CREATE_PROVIDER=$(jq -r '.oidc.create_provider // true' "${CONFIG_FILE}")

  OIDC_STACK_NAME="${PROJECT_NAME}-github-oidc"

  info "Loaded OIDC configuration for: ${GITHUB_ORG}/${GITHUB_REPO}"
}

#
# Check if OIDC provider exists
#
check_oidc_provider() {
  section "Checking for Existing OIDC Provider"

  if [[ -n "${PROVIDER_ARN}" ]]; then
    info "Using configured OIDC provider: ${PROVIDER_ARN}"
    return 0
  fi

  local provider_url="token.actions.githubusercontent.com"
  local existing_arn

  existing_arn=$(aws iam list-open-id-connect-providers \
    --query "OpenIDConnectProviderList[?ends_with(Arn, '/${provider_url}')].Arn" \
    --output text 2>/dev/null || echo "")

  if [[ -n "${existing_arn}" ]]; then
    info "Found existing OIDC provider: ${existing_arn}"
    PROVIDER_ARN="${existing_arn}"
    CREATE_PROVIDER="false"

    # Update config file with found provider ARN
    local tmp_config
    tmp_config=$(mktemp)
    jq ".oidc.provider_arn = \"${PROVIDER_ARN}\" | .oidc.create_provider = false" \
      "${CONFIG_FILE}" > "${tmp_config}"
    mv "${tmp_config}" "${CONFIG_FILE}"

    success "Configuration updated with existing provider ARN"
  else
    info "No existing OIDC provider found, will create new one"
    CREATE_PROVIDER="true"
  fi
}

#
# Deploy OIDC stack
#
deploy_oidc_stack() {
  section "Deploying OIDC Stack"

  check_aws_cli
  check_jq

  local params=(
    "ProjectName=${PROJECT_NAME}"
    "GitHubOrg=${GITHUB_ORG}"
    "GitHubRepo=${GITHUB_REPO}"
  )

  if [[ "${CREATE_PROVIDER}" == "false" && -n "${PROVIDER_ARN}" ]]; then
    params+=("OIDCProviderArn=${PROVIDER_ARN}")
    info "Reusing existing OIDC provider"
  else
    info "Creating new OIDC provider"
  fi

  info "Deploying OIDC stack: ${OIDC_STACK_NAME}..."
  aws cloudformation deploy \
    --template-file "${OIDC_TEMPLATE}" \
    --stack-name "${OIDC_STACK_NAME}" \
    --parameter-overrides "${params[@]}" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "${REGION}" \
    --no-fail-on-empty-changeset

  success "OIDC stack deployment complete!"
}

#
# Get and display stack outputs
#
show_setup_instructions() {
  section "Setup Complete"

  local role_arn
  local provider_arn

  role_arn=$(aws cloudformation describe-stacks \
    --stack-name "${OIDC_STACK_NAME}" \
    --region "${REGION}" \
    --query 'Stacks[0].Outputs[?OutputKey==`RoleArn`].OutputValue' \
    --output text)

  provider_arn=$(aws cloudformation describe-stacks \
    --stack-name "${OIDC_STACK_NAME}" \
    --region "${REGION}" \
    --query 'Stacks[0].Outputs[?OutputKey==`OIDCProviderArn`].OutputValue' \
    --output text)

  echo ""
  success "✅ OIDC setup complete!"
  echo ""
  info "IAM Role ARN: ${role_arn}"
  info "OIDC Provider ARN: ${provider_arn}"
  echo ""

  cat << EOF
📝 Next Steps:

1. Add the following secret to your GitHub repository:
   Repository → Settings → Secrets and variables → Actions → New repository secret

   Name:  KRAKEN_PROXY_AWS_ROLE_ARN
   Value: ${role_arn}

2. Update deploy-config.json if needed:
   - Set your domain name and hosted zone ID
   - Verify subdomain preference

3. Deploy infrastructure:
   ./scripts/deploy.sh infra

4. Deploy Lambda code:
   ./scripts/deploy.sh update

📚 Documentation:
   See README.md for detailed deployment instructions

🔒 Security:
   The IAM role is scoped to: ${GITHUB_ORG}/${GITHUB_REPO}
   Tokens are short-lived and repository-specific

EOF
}

#
# Main execution
#
main() {
  header "GitHub OIDC Setup for Kraken Proxy"

  load_config
  check_oidc_provider
  deploy_oidc_stack
  show_setup_instructions
}

main "$@"
