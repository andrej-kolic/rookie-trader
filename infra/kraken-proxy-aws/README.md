# Kraken Proxy AWS Infrastructure

Cost-optimized AWS infrastructure for deploying the Kraken Proxy API using Lambda, CloudFront, and Route53.

## 🏗️ Architecture

- **AWS Lambda** - Serverless Express.js API (Node.js 20)
- **Lambda Function URL** - Direct HTTPS endpoint (no API Gateway cost)
- **CloudFront** - Custom domain support + CORS headers + caching
- **Route 53** - DNS management for custom subdomain
- **ACM Certificate** - Free SSL/TLS certificate
- **CloudWatch Logs** - Application logging (7-day retention)

**Monthly Cost**: ~$1-2 (mostly Route53 + CloudFront requests under free tier)

## 📋 Prerequisites

- AWS account with admin access
- Domain with Route 53 hosted zone
- GitHub repository with Actions enabled
- AWS CLI installed and configured
- `jq` installed (`brew install jq` on macOS)
- `pnpm` installed

## 🚀 Quick Start

### 1. Configure Deployment

Edit [`deploy-config.json`](deploy-config.json):

```json
{
  "project_name": "kraken-proxy",
  "region": "us-east-1",
  "oidc": {
    "provider_arn": "",
    "github_org": "your-github-username",
    "github_repo": "rookie-trader",
    "create_provider": false
  },
  "parameters": {
    "DomainName": "yourdomain.com",
    "SubDomain": "kraken",
    "HostedZoneId": "Z1234567890ABC",
    "NodeRuntime": "nodejs20.x",
    "LambdaMemory": "512",
    "LambdaTimeout": "30"
  }
}
```

**Key parameters**:

- `DomainName`: Your apex domain (e.g., `example.com`)
- `SubDomain`: Subdomain prefix (creates `kraken.example.com`)
- `HostedZoneId`: Route 53 hosted zone ID for your domain
- `LambdaMemory`: Memory allocation (affects cost and performance)

### 2. Setup GitHub OIDC (One-time)

This allows GitHub Actions to deploy without storing AWS credentials.

**Option A: Using script**

```bash
cd infra/kraken-proxy-aws
./scripts/oidc.sh
```

**Option B: Using GitHub Actions**

1. Go to repository **Actions** tab
2. Select **"Setup GitHub OIDC"** workflow
3. Click **"Run workflow"**
4. Type `yes` to confirm
5. Copy the Role ARN from output

**Add GitHub Secret**:

- Go to **Settings → Secrets and variables → Actions**
- Create secret: `KRAKEN_PROXY_AWS_ROLE_ARN`
- Value: The Role ARN from setup output

### 3. Deploy Infrastructure

```bash
# Validate templates
make validate

# Deploy complete infrastructure
make deploy-infra

# Or using script directly
./scripts/deploy.sh infra
```

This creates:

- Lambda function (placeholder code)
- CloudFront distribution
- ACM certificate (DNS validated)
- Route 53 records

**Note**: Certificate validation takes 5-10 minutes.

### 4. Deploy Application Code

```bash
# Build and deploy Lambda code
make deploy-update

# Or using script
./scripts/deploy.sh update
```

This:

1. Builds TypeScript code in `apps/kraken-proxy`
2. Bundles with dependencies
3. Creates Lambda deployment package
4. Updates Lambda function code

### 5. View Deployment Info

```bash
make outputs
# Or
./scripts/deploy.sh outputs
```

## 📦 Deployment Actions

### Local Deployment

```bash
# Validate CloudFormation templates
./scripts/deploy.sh validate

# Deploy infrastructure (CloudFormation)
./scripts/deploy.sh infra

# Update Lambda code only
./scripts/deploy.sh update

# Display stack outputs
./scripts/deploy.sh outputs
```

### GitHub Actions

**Manual deployment**:

1. Go to **Actions** tab
2. Select **"Deploy Kraken Proxy"** workflow
3. Click **"Run workflow"**
4. Choose action:
   - `infra` - Deploy/update CloudFormation stack
   - `update` - Update Lambda code only
   - `outputs` - Display deployment info

**Automatic deployment**:

- Push to `main` branch → triggers `update` action
- Changes in `infra/kraken-proxy-aws/**` or `apps/kraken-proxy/**`

## 🔧 Configuration Details

### Lambda Settings

Adjust in `deploy-config.json`:

```json
{
  "parameters": {
    "NodeRuntime": "nodejs20.x",
    "LambdaMemory": "512", // MB (affects cost)
    "LambdaTimeout": "30" // seconds
  }
}
```

**Memory recommendations**:

- `256 MB` - Minimal cost, slower cold starts
- `512 MB` - Balanced (recommended)
- `1024 MB` - Faster execution, higher cost

### CloudFront Caching

Default: Minimal caching (API responses change frequently)

Modify in [`templates/cloudfront.yaml`](templates/cloudfront.yaml) → `CachePolicy`

### CORS Configuration

Configured in [`templates/cloudfront.yaml`](templates/cloudfront.yaml) → `ResponseHeadersPolicy`

Default allows all origins (`*`). Restrict in production if needed.

## 📁 Project Structure

```
infra/kraken-proxy-aws/
├── deploy-config.json          # Deployment configuration
├── package.json                # NPM scripts
├── Makefile                    # Build shortcuts
├── README.md                   # This file
│
├── .github/
│   ├── workflows/
│   │   ├── deploy.yaml         # Main deployment workflow
│   │   ├── setup-oidc.yaml     # OIDC setup workflow
│   │   └── validate.yaml       # Template validation
│   └── actions/
│       └── deploy/
│           └── action.yaml     # Composite deploy action
│
├── scripts/
│   ├── deploy.sh               # Main deployment script
│   ├── oidc.sh                 # OIDC setup script
│   └── helpers.sh              # Shared utilities
│
└── templates/
    ├── main.yaml               # Master stack (nested)
    ├── lambda.yaml             # Lambda function + URL
    ├── cloudfront.yaml         # CloudFront distribution
    ├── acm-certificate.yaml    # SSL certificate
    ├── route53.yaml            # DNS records
    └── github-oidc.yaml        # OIDC provider + role
```

## 🔍 Monitoring & Debugging

### View Lambda Logs

```bash
# Get log group name
aws cloudformation describe-stacks \
  --stack-name kraken-proxy \
  --query 'Stacks[0].Outputs[?OutputKey==`LogGroupName`].OutputValue' \
  --output text

# Tail logs
aws logs tail /aws/lambda/kraken-proxy-api --follow
```

### Test Lambda Function

```bash
# Get function URL
FUNCTION_URL=$(aws cloudformation describe-stacks \
  --stack-name kraken-proxy \
  --query 'Stacks[0].Outputs[?OutputKey==`FunctionUrl`].OutputValue' \
  --output text)

# Test endpoint
curl "${FUNCTION_URL}health"
```

### Test via CloudFront

```bash
# Get custom domain URL
curl https://kraken.yourdomain.com/health
```

## 🛠️ Troubleshooting

### Certificate validation stuck

- Verify hosted zone ID is correct
- Check NS records point to Route 53
- Wait 10-15 minutes for DNS propagation

### Lambda deployment fails

```bash
# Check build output
cd apps/kraken-proxy
pnpm run build

# Verify dist/ folder exists
ls -la dist/
```

### Function URL 403 error

- Check Lambda resource policy allows public invocation
- Verify CORS headers in CloudFront

### Stack update fails

```bash
# View CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name kraken-proxy \
  --max-items 20
```

## 💰 Cost Optimization

### Reduce costs further

1. **Lower Lambda memory**: Change to `256 MB` if performance allows
2. **Reduce log retention**: Change to 1 day in `templates/lambda.yaml`
3. **Use CloudFront caching**: Enable caching for static endpoints
4. **Monitor usage**: Set up billing alerts in AWS Console

### Free tier coverage

- **Lambda**: 1M requests/month free
- **CloudFront**: 1TB data transfer/month (first 12 months)
- **Route 53**: $0.50/month per hosted zone (not free)
- **ACM**: Free

## 🔐 Security

- **No secrets in Lambda** - Frontend provides Kraken API keys
- **HTTPS only** - Enforced via CloudFront
- **Function URL auth** - Set to `NONE` (public API)
- **CORS** - Configured in CloudFront headers
- **IAM roles** - Scoped to specific GitHub repository

## 🧹 Cleanup

To delete all resources:

```bash
# Delete main stack (deletes nested stacks)
aws cloudformation delete-stack \
  --stack-name kraken-proxy \
  --region us-east-1

# Delete OIDC stack (optional, reusable)
aws cloudformation delete-stack \
  --stack-name kraken-proxy-github-oidc \
  --region us-east-1

# Delete template bucket
aws s3 rb s3://kraken-proxy-cf-templates-ACCOUNT_ID-us-east-1 --force
```

## 📚 Additional Resources

- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [Lambda Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)
- [GitHub OIDC for AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)

## 🆘 Support

For issues or questions:

1. Check CloudFormation events for detailed error messages
2. Review Lambda CloudWatch logs
3. Validate configuration in `deploy-config.json`
4. Ensure all prerequisites are met
