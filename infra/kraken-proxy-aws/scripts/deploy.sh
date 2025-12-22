#!/usr/bin/env bash
#
# Deployment script for Kraken Proxy AWS Infrastructure
#
# Usage: ./deploy.sh <action>
#
# Actions:
#   infra      - Deploy CloudFormation infrastructure
#   update     - Update Lambda function code
#   outputs    - Display stack outputs
#   validate   - Validate CloudFormation templates
#   help       - Display this help message
#

set -euo pipefail

# shellcheck source=./helpers.sh
source "$(dirname "$0")/helpers.sh"

# Constants
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly TEMPLATES_DIR="${PROJECT_DIR}/templates"
readonly CONFIG_FILE="${PROJECT_DIR}/deploy-config.json"
readonly KRAKEN_PROXY_DIR="${PROJECT_DIR}/../../apps/kraken-proxy"

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
  DOMAIN_NAME=$(jq -r '.parameters.DomainName' "${CONFIG_FILE}")
  SUB_DOMAIN=$(jq -r '.parameters.SubDomain' "${CONFIG_FILE}")
  HOSTED_ZONE_ID=$(jq -r '.parameters.HostedZoneId' "${CONFIG_FILE}")
  NODE_RUNTIME=$(jq -r '.parameters.NodeRuntime' "${CONFIG_FILE}")
  LAMBDA_MEMORY=$(jq -r '.parameters.LambdaMemory' "${CONFIG_FILE}")
  LAMBDA_TIMEOUT=$(jq -r '.parameters.LambdaTimeout' "${CONFIG_FILE}")

  STACK_NAME="${PROJECT_NAME}"
  TEMPLATE_BUCKET="${PROJECT_NAME}-cf-templates-$(get_account_id)-${REGION}"

  info "Loaded configuration for project: ${PROJECT_NAME}"
}

#
# Validate CloudFormation templates
#
validate_templates() {
  section "Validating CloudFormation Templates"

  local templates=(
    "main.yaml"
    "lambda.yaml"
    "acm-certificate.yaml"
    "cloudfront.yaml"
    "route53.yaml"
    "github-oidc.yaml"
  )

  for template in "${templates[@]}"; do
    local template_path="${TEMPLATES_DIR}/${template}"
    if [[ -f "${template_path}" ]]; then
      info "Validating ${template}..."
      if aws cloudformation validate-template \
        --template-body "file://${template_path}" \
        --region "${REGION}" >/dev/null 2>&1; then
        success "${template} is valid"
      else
        error "${template} validation failed"
        return 1
      fi
    fi
  done

  success "All templates validated successfully"
}

#
# Build Lambda function code
#
build_lambda() {
  section "Building Lambda Function Code"

  if [[ ! -d "${KRAKEN_PROXY_DIR}" ]]; then
    error "kraken-proxy directory not found: ${KRAKEN_PROXY_DIR}"
    exit 1
  fi

  local build_dir="${PROJECT_DIR}/lambda"
  local output_zip="${PROJECT_DIR}/lambda.zip"

  info "Building TypeScript code..."
  (
    cd "${KRAKEN_PROXY_DIR}"
    pnpm run build
  )

  info "Preparing Lambda package..."
  rm -rf "${build_dir}"
  mkdir -p "${build_dir}"

  # Copy built files
  cp -r "${KRAKEN_PROXY_DIR}/dist/"* "${build_dir}/"

  # Create empty .env file to prevent ts-kraken from crashing
  touch "${build_dir}/.env"

  # Copy package.json for dependency installation
  cp "${KRAKEN_PROXY_DIR}/package.json" "${build_dir}/"

  info "Installing production dependencies..."
  (
    cd "${build_dir}"

    # Create package-lock.json to prevent pnpm issues
    # Clean up package.json for Lambda
    jq 'del(.devDependencies, .scripts, .pnpm, .workspaces) |
        .main = "lambda-handler.js" |
        .type = "module" |
        .dependencies += {"@vendia/serverless-express": "latest"}' package.json > package.json.tmp
    mv package.json.tmp package.json

    # Use npm instead of pnpm to avoid workspace issues
    npm install --production --no-audit --no-fund
  )

  # Create Lambda handler wrapper
  cat > "${build_dir}/lambda-handler.js" << 'EOF'
// Lambda handler wrapper for Express app
// Set dummy env vars before any imports to prevent ts-kraken from crashing
if (!process.env.KRAKEN_API_KEY) {
  process.env.KRAKEN_API_KEY = 'dummy';
}
if (!process.env.KRAKEN_API_SECRET) {
  process.env.KRAKEN_API_SECRET = 'dummy';
}

import serverlessExpress from '@vendia/serverless-express';
import { app } from './index.js';

// Don't call app.listen() in Lambda
export const handler = serverlessExpress({ app });
EOF

  info "Creating deployment package..."
  (
    cd "${build_dir}"
    zip -r "${output_zip}" . -x "*.git*" "*.DS_Store" "*package-lock.json"
  )

  success "Lambda package created: ${output_zip}"
}

#
# Deploy CloudFormation infrastructure
#
deploy_infra() {
  section "Deploying CloudFormation Infrastructure"

  check_aws_cli
  check_jq

  # Create S3 bucket for templates if it doesn't exist
  create_template_bucket "${TEMPLATE_BUCKET}" "${REGION}"

  # Package templates
  info "Packaging CloudFormation templates..."
  aws cloudformation package \
    --template-file "${TEMPLATES_DIR}/main.yaml" \
    --s3-bucket "${TEMPLATE_BUCKET}" \
    --output-template-file "${PROJECT_DIR}/packaged.template" \
    --region "${REGION}"

  # Deploy stack
  info "Deploying stack: ${STACK_NAME}..."
  aws cloudformation deploy \
    --template-file "${PROJECT_DIR}/packaged.template" \
    --stack-name "${STACK_NAME}" \
    --parameter-overrides \
      ProjectName="${PROJECT_NAME}" \
      DomainName="${DOMAIN_NAME}" \
      SubDomain="${SUB_DOMAIN}" \
      HostedZoneId="${HOSTED_ZONE_ID}" \
      NodeRuntime="${NODE_RUNTIME}" \
      LambdaMemory="${LAMBDA_MEMORY}" \
      LambdaTimeout="${LAMBDA_TIMEOUT}" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "${REGION}" \
    --no-fail-on-empty-changeset

  success "Infrastructure deployment complete!"

  # Show outputs
  get_outputs
}

#
# Update Lambda function code
#
update_lambda() {
  section "Updating Lambda Function Code"

  check_aws_cli

  # Build Lambda package
  build_lambda

  # Get function name from stack
  local function_name
  function_name=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query 'Stacks[0].Outputs[?OutputKey==`LambdaFunctionName`].OutputValue' \
    --output text)

  if [[ -z "${function_name}" ]]; then
    error "Could not retrieve Lambda function name from stack"
    exit 1
  fi

  info "Updating function: ${function_name}..."
  aws lambda update-function-code \
    --function-name "${function_name}" \
    --zip-file "fileb://${PROJECT_DIR}/lambda.zip" \
    --region "${REGION}" \
    --publish

  success "Lambda function updated successfully!"

  # Wait for update to complete
  info "Waiting for function update to complete..."
  aws lambda wait function-updated \
    --function-name "${function_name}" \
    --region "${REGION}"

  success "Function update complete!"
}

#
# Get and display stack outputs
#
get_outputs() {
  section "Stack Outputs"

  local outputs
  outputs=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query 'Stacks[0].Outputs' \
    --output json 2>/dev/null)

  if [[ -z "${outputs}" || "${outputs}" == "null" ]]; then
    warning "No outputs found for stack: ${STACK_NAME}"
    return
  fi

  echo "${outputs}" | jq -r '.[] | "\(.OutputKey): \(.OutputValue)"' | while read -r line; do
    info "${line}"
  done

  # Highlight important URLs
  echo ""
  local api_url
  api_url=$(echo "${outputs}" | jq -r '.[] | select(.OutputKey=="ApiUrl") | .OutputValue')
  if [[ -n "${api_url}" && "${api_url}" != "null" ]]; then
    success "🚀 API URL: ${api_url}"
  fi
}

#
# Show usage information
#
show_help() {
  cat << EOF
Kraken Proxy AWS Deployment Script

Usage: $0 <action>

Actions:
  infra      Deploy CloudFormation infrastructure
  update     Update Lambda function code only
  outputs    Display stack outputs
  validate   Validate CloudFormation templates
  help       Display this help message

Examples:
  $0 infra          # Deploy complete infrastructure
  $0 update         # Update Lambda code after changes
  $0 outputs        # View deployment information
  $0 validate       # Validate templates before deployment

Configuration:
  Edit deploy-config.json to configure:
  - Domain name and subdomain
  - Lambda settings (memory, timeout)
  - AWS region

EOF
}

#
# Main execution
#
main() {
  if [[ $# -eq 0 ]]; then
    error "No action specified"
    show_help
    exit 1
  fi

  local action="$1"

  # Load configuration for all actions except help
  if [[ "${action}" != "help" ]]; then
    load_config
  fi

  case "${action}" in
    infra)
      deploy_infra
      ;;
    update)
      update_lambda
      ;;
    outputs)
      get_outputs
      ;;
    validate)
      validate_templates
      ;;
    help)
      show_help
      ;;
    *)
      error "Unknown action: ${action}"
      show_help
      exit 1
      ;;
  esac
}

main "$@"
