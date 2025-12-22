# AI Coding Agent Instructions

## Project Overview

This is a **cost-optimized AWS infrastructure package** for deploying the **Kraken Proxy API** (Express.js/Node.js) using serverless Lambda, CloudFront, and Route53. The architecture is designed for a pet project with minimal monthly costs (~$1-2) while maintaining professional infrastructure-as-code practices.

## Architecture & Components

### Core Stack Structure

- **Main template**: `templates/main.yaml` - orchestrates five nested stacks
- **Lambda stack**: Serverless Express.js API with Function URL (no API Gateway)
- **CloudFront stack**: Custom domain support, CORS headers, minimal caching
- **ACM Certificate stack**: SSL/TLS certificates (must be in us-east-1)
- **Route 53 stack**: DNS records for custom subdomain

### Key Design Patterns

- **Nested stacks**: Each component isolated for modularity
- **Resource dependencies**: Stacks pass outputs as inputs (e.g., Certificate ARN → CloudFront)
- **Single deployment**: No environment isolation (pet project scope)
- **Cost-first**: Lambda Function URL instead of API Gateway, minimal caching, low memory allocation

## Configuration System

### Single Deployment Configuration

All settings in `deploy-config.json`:

```json
{
  "project_name": "kraken-proxy",
  "region": "us-east-1",
  "oidc": {
    "provider_arn": "",
    "github_org": "username",
    "github_repo": "repo-name",
    "create_provider": false
  },
  "parameters": {
    "DomainName": "example.com",
    "SubDomain": "kraken",
    "HostedZoneId": "Z123...",
    "NodeRuntime": "nodejs20.x",
    "LambdaMemory": "512",
    "LambdaTimeout": "30"
  }
}
```

**Critical**: `create_provider: false` assumes OIDC provider exists from another project (e.g., `infra/aws`)

### Parameter Naming Convention

- `ProjectName`: Used for resource naming (lowercase, hyphenated, 3-20 chars)
- `DomainName`: Apex domain (example.com)
- `SubDomain`: Prefix for full domain (kraken → kraken.example.com)
- `NodeRuntime`: Lambda Node.js version
- `LambdaMemory`: Memory allocation in MB (affects cost and performance)
- `LambdaTimeout`: Max execution time in seconds

## Deployment Workflows

### Script-Based Deployment

#### Main deployment script (`scripts/deploy.sh`)

```bash
./scripts/deploy.sh <action>
```

**Actions**:

- `infra` - Deploy CloudFormation infrastructure
- `update` - Update Lambda function code only (builds from `apps/kraken-proxy`)
- `outputs` - Display stack outputs (URLs, function name, log group)
- `validate` - Validate CloudFormation templates
- `help` - Display usage information

#### OIDC setup script (`scripts/oidc.sh`)

```bash
./scripts/oidc.sh
```

One-time GitHub OIDC setup (account-level, creates IAM role for GitHub Actions, reuses existing OIDC provider)

**Key Implementation Details**:

- Uses `jq` to parse `deploy-config.json`
- Creates template package bucket: `{project_name}-cf-templates-{account-id}-{region}`
- Stack naming: `{project_name}` (e.g., `kraken-proxy`)
- OIDC stack naming: `{project_name}-github-oidc`
- Lambda build: Compiles TypeScript from `apps/kraken-proxy`, bundles with dependencies

### GitHub Actions Integration

- **OIDC Authentication**: No long-lived AWS keys stored in GitHub
- **Single deployment**: No environment branching logic
- **Concurrency control**: Prevents conflicting deployments
- **Dual-action support**: Separate `infra` and `update` workflows

### Lambda Deployment Pattern

1. **Build**: Compile TypeScript in `apps/kraken-proxy` via `pnpm run build`
2. **Bundle**: Copy `dist/` + `package.json`, install prod dependencies
3. **Wrap**: Create Lambda handler wrapper using `@vendia/serverless-express`
4. **Package**: Zip entire bundle
5. **Deploy**: Update Lambda function code via AWS CLI

**Note**: Requires Lambda adapter to run Express.js app

## File Organization Conventions

### Template Structure

```
templates/
├── main.yaml               # Master template with nested stacks
├── lambda.yaml             # Lambda function + Function URL
├── cloudfront.yaml         # CloudFront distribution + policies
├── acm-certificate.yaml    # SSL certificate management
├── route53.yaml            # DNS A/AAAA records
└── github-oidc.yaml        # GitHub Actions authentication setup
```

### Resource Naming Pattern

- **Stacks**: `{ProjectName}` (e.g., `kraken-proxy`)
- **Lambda Function**: `{ProjectName}-api`
- **IAM Roles**: `{ProjectName}-lambda-role`, `{ProjectName}-github-actions-role`
- **Log Group**: `/aws/lambda/{ProjectName}-api`

### Build Artifacts

- `lambda/` - Build directory for Lambda package
- `lambda.zip` - Deployment package
- `packaged.template` - CloudFormation package output

## Development Workflows

### Local Development Commands

```bash
# Validate CloudFormation templates
./scripts/deploy.sh validate

# Deploy infrastructure changes
./scripts/deploy.sh infra

# Update Lambda code only
./scripts/deploy.sh update

# View stack information
./scripts/deploy.sh outputs

# Get help information
./scripts/deploy.sh help
```

### Making Changes

**Infrastructure changes**: Modify templates in `templates/`, then run `infra` action
**Application code changes**: Modify `apps/kraken-proxy/src/`, then run `update` action
**Configuration changes**: Update `deploy-config.json`, may require `infra` redeploy

### CloudFront Customization

Modify policies in `templates/cloudfront.yaml`:

- **CachePolicy**: TTL settings for API caching
- **OriginRequestPolicy**: Headers/cookies forwarded to Lambda
- **ResponseHeadersPolicy**: CORS and security headers

## Critical Dependencies & Constraints

- **Region lock**: Templates must deploy to `us-east-1` (ACM certificate requirement for CloudFront)
- **Domain prerequisites**: Must have Route 53 hosted zone in same AWS account
- **OIDC setup**: Required once per AWS account for GitHub Actions authentication
- **CLI tools**: Requires `jq`, `pnpm`, and AWS CLI configured locally for script deployment
- **Build environment**: Requires Node.js 20+ and pnpm for Lambda builds

## Cost Optimization Strategies

- **Lambda Function URL**: Free (vs API Gateway ~$1/million)
- **Low memory allocation**: 512 MB balances performance and cost
- **Minimal caching**: 0-1 second TTL (dynamic API)
- **Short log retention**: 7 days (vs default indefinite)
- **PriceClass_100**: CloudFront serves from cheapest edge locations only

## GitHub Actions Architecture

- **Composite Action**: `.github/actions/deploy/action.yaml` encapsulates deployment logic
- **Push triggers**: Main branch changes auto-deploy Lambda code
- **Manual dispatch**: Workflow can be run manually with action selection
- **Concurrency control**: Uses workflow + ref + action for unique group naming

## Application-Specific Details

### Kraken Proxy API

- **Express.js REST API** proxying Kraken cryptocurrency exchange
- **No backend secrets**: Frontend provides Kraken API keys via request headers
- **CORS required**: Frontend needs cross-origin access
- **Stateless**: Perfect for Lambda (no persistent connections)
- **Build output**: TypeScript compiled to `dist/`, CJS modules

### Lambda Adapter

Uses `@vendia/serverless-express` to wrap Express app:

- Converts API Gateway/Lambda events → HTTP requests
- Handles binary content encoding
- Supports Function URLs (simpler than API Gateway integration)

## Troubleshooting Patterns

**Stack deployment failures**: Check CloudFormation events, often certificate validation issues
**Lambda code not updating**: Verify build succeeded in `apps/kraken-proxy/dist/`
**OIDC authentication errors**: Ensure GitHub secret `KRAKEN_PROXY_AWS_ROLE_ARN` is set correctly
**Function URL 403**: Check Lambda resource policy allows public invocation
**Domain resolution issues**: Verify hosted zone configuration and DNS propagation (5-10 min)
**Cold start issues**: Consider increasing Lambda memory or using provisioned concurrency

## Key Differences from `infra/aws`

| Feature      | infra/aws        | infra/kraken-proxy-aws |
| ------------ | ---------------- | ---------------------- |
| Architecture | S3 + CloudFront  | Lambda + CloudFront    |
| Deployment   | Static files     | Application code       |
| Environments | dev/staging/prod | Single deployment      |
| Monthly cost | ~$1              | ~$1-2                  |
| Update speed | Fast (S3 sync)   | Medium (Lambda update) |
| Cold starts  | None             | 1-2 seconds            |

## OIDC Reuse Strategy

- **Provider**: Reuses existing from `infra/aws` (one per AWS account)
- **Role**: New role specific to kraken-proxy with Lambda/CloudFront permissions
- **Secret name**: `KRAKEN_PROXY_AWS_ROLE_ARN` (different from static site)

## Security Considerations

- **Public Function URL**: No authentication (API expects frontend to provide keys)
- **CORS**: Allow all origins (`*`) - restrict in production if needed
- **HTTPS only**: Enforced via CloudFront
- **No secrets in Lambda**: Environment variables only contain NODE_ENV, LOG_LEVEL
- **IAM least privilege**: Lambda role has only CloudWatch Logs access
