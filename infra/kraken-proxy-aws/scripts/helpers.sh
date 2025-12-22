#!/usr/bin/env bash
#
# Helper functions for deployment scripts
#
# This file provides common utilities for logging, AWS operations,
# and dependency checking.
#

# Colors for output
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_RESET='\033[0m'

#
# Logging functions
#
error() {
  echo -e "${COLOR_RED}✗ ERROR: $*${COLOR_RESET}" >&2
}

warning() {
  echo -e "${COLOR_YELLOW}⚠ WARNING: $*${COLOR_RESET}"
}

info() {
  echo -e "${COLOR_BLUE}ℹ $*${COLOR_RESET}"
}

success() {
  echo -e "${COLOR_GREEN}✓ $*${COLOR_RESET}"
}

section() {
  echo ""
  echo -e "${COLOR_CYAN}▸ $*${COLOR_RESET}"
  echo "────────────────────────────────────────────────────────"
}

header() {
  echo ""
  echo "════════════════════════════════════════════════════════"
  echo -e "${COLOR_CYAN}  $*${COLOR_RESET}"
  echo "════════════════════════════════════════════════════════"
  echo ""
}

#
# Dependency checks
#
check_aws_cli() {
  if ! command -v aws &> /dev/null; then
    error "AWS CLI is not installed. Please install it first."
    error "Visit: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    exit 1
  fi

  # Check if AWS credentials are configured
  if ! aws sts get-caller-identity &> /dev/null; then
    error "AWS credentials are not configured. Please run 'aws configure'."
    exit 1
  fi

  success "AWS CLI is available and configured"
}

check_jq() {
  if ! command -v jq &> /dev/null; then
    error "jq is not installed. Please install it first."
    error "Visit: https://stedolan.github.io/jq/download/"
    exit 1
  fi
  success "jq is available"
}

check_pnpm() {
  if ! command -v pnpm &> /dev/null; then
    error "pnpm is not installed. Please install it first."
    error "Visit: https://pnpm.io/installation"
    exit 1
  fi
  success "pnpm is available"
}

#
# AWS utility functions
#
get_account_id() {
  aws sts get-caller-identity --query Account --output text
}

get_caller_identity() {
  aws sts get-caller-identity --output json
}

#
# S3 bucket operations
#
create_template_bucket() {
  local bucket_name="$1"
  local region="$2"

  if aws s3 ls "s3://${bucket_name}" 2>/dev/null; then
    info "Template bucket already exists: ${bucket_name}"
    return 0
  fi

  info "Creating template bucket: ${bucket_name}"

  if [[ "${region}" == "us-east-1" ]]; then
    aws s3api create-bucket \
      --bucket "${bucket_name}" \
      --region "${region}"
  else
    aws s3api create-bucket \
      --bucket "${bucket_name}" \
      --region "${region}" \
      --create-bucket-configuration LocationConstraint="${region}"
  fi

  # Enable versioning
  aws s3api put-bucket-versioning \
    --bucket "${bucket_name}" \
    --versioning-configuration Status=Enabled

  # Block public access
  aws s3api put-public-access-block \
    --bucket "${bucket_name}" \
    --public-access-block-configuration \
      "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

  success "Template bucket created successfully"
}

#
# Stack operations
#
stack_exists() {
  local stack_name="$1"
  local region="$2"

  aws cloudformation describe-stacks \
    --stack-name "${stack_name}" \
    --region "${region}" \
    --output json &>/dev/null
}

wait_for_stack() {
  local stack_name="$1"
  local region="$2"
  local operation="${3:-create}" # create, update, or delete

  info "Waiting for stack ${operation} to complete..."

  case "${operation}" in
    create)
      aws cloudformation wait stack-create-complete \
        --stack-name "${stack_name}" \
        --region "${region}"
      ;;
    update)
      aws cloudformation wait stack-update-complete \
        --stack-name "${stack_name}" \
        --region "${region}"
      ;;
    delete)
      aws cloudformation wait stack-delete-complete \
        --stack-name "${stack_name}" \
        --region "${region}"
      ;;
  esac
}

get_stack_output() {
  local stack_name="$1"
  local output_key="$2"
  local region="$3"

  aws cloudformation describe-stacks \
    --stack-name "${stack_name}" \
    --region "${region}" \
    --query "Stacks[0].Outputs[?OutputKey=='${output_key}'].OutputValue" \
    --output text
}

#
# CloudFormation template validation
#
validate_template() {
  local template_file="$1"
  local region="$2"

  aws cloudformation validate-template \
    --template-body "file://${template_file}" \
    --region "${region}" \
    --output json
}

#
# Confirm action
#
confirm() {
  local message="$1"
  local response

  echo -e "${COLOR_YELLOW}${message} (y/N): ${COLOR_RESET}"
  read -r response

  case "${response}" in
    [yY][eE][sS]|[yY])
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

#
# Spinner for long-running operations
#
spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'

  while ps -p "${pid}" > /dev/null 2>&1; do
    local temp=${spinstr#?}
    printf " [%c]  " "${spinstr}"
    local spinstr=${temp}${spinstr%"$temp"}
    sleep ${delay}
    printf "\b\b\b\b\b\b"
  done

  printf "    \b\b\b\b"
}
