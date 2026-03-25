# Deploying to AWS

This guide walks through deploying the Moore Maternal Care application on AWS
using **ECS Fargate** for the main Node.js/React server and **AWS Lambda +
API Gateway** for the HIPAA-compliant PHI (Protected Health Information) API.

---

## Architecture Overview

```
Internet
   │
   ▼
Application Load Balancer (ALB)
   │
   ▼
ECS Fargate – main Express/React app  ──►  RDS PostgreSQL (private subnet)
   │                                         ▲
   │  (proxies /phi/* requests)              │
   ▼                                         │
API Gateway HTTP API                         │
   │                                         │
   ▼                                         │
Lambda – PHI handler ──────────────────────►┘
   (server/aws/lambda_handler.js)

Auth:  Amazon Cognito User Pool  ◄──── all services
```

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| AWS CLI | 2.x |
| Docker | 24.x |
| Node.js | 20.x |
| `jq` | any |

---

## Step 1 – Configure AWS Cognito

1. Open the [AWS Console → Cognito](https://console.aws.amazon.com/cognito).
2. Create a **User Pool** (or use an existing one).
3. Under **App clients**, create a new client and note:
   - **User Pool ID** (e.g. `us-east-1_XXXXXXXXX`)
   - **Client ID**
   - **Client Secret**
4. Add a **Hosted UI** domain (e.g. `https://auth.yourdomain.com`).
5. Set allowed callback URLs (add later once the ALB DNS is known):
   - `https://<ALB_DNS>/auth/callback`
6. Set allowed sign-out URLs:
   - `https://<ALB_DNS>/`
7. Create two **Groups** in the user pool: `patient` and `clinician`.

---

## Step 2 – Bootstrap the CloudFormation stack

```bash
# Clone / cd into the repo
cd cameronspine-OB

# Generate a 32-byte encryption key
FIELD_ENCRYPTION_KEY=$(openssl rand -base64 32)

# Deploy the stack (replace every <…> placeholder)
aws cloudformation deploy \
  --template-file aws/cloudformation.yaml \
  --stack-name cameronspine-ob-prod \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    AppName=cameronspine-ob \
    Environment=production \
    DbPassword="<STRONG_PASSWORD_MIN_16_CHARS>" \
    SessionSecret="<RANDOM_32_CHAR_STRING>" \
    FieldEncryptionKey="$FIELD_ENCRYPTION_KEY" \
    ContainerImage="placeholder" \
    CognitoDomain="https://<YOUR_COGNITO_DOMAIN>.auth.<REGION>.amazoncognito.com" \
    CognitoClientId="<CLIENT_ID>" \
    CognitoClientSecret="<CLIENT_SECRET>" \
    CognitoRedirectUri="https://<ALB_DNS>/auth/callback" \
    CognitoLogoutRedirectUri="https://<ALB_DNS>/"
```

### Collect stack outputs

```bash
aws cloudformation describe-stacks \
  --stack-name cameronspine-ob-prod \
  --query "Stacks[0].Outputs" \
  --output table
```

Note the values for:
- `ECRRepositoryUri`
- `AppURL`
- `PhiApiUrl`
- `GitHubActionsRoleArn`
- `DatabaseEndpoint`

---

## Step 3 – Run the database migration

```bash
# Set the RDS connection URL (tunnel through a bastion or VPN as needed)
export DATABASE_URL="postgresql://appuser:<DB_PASSWORD>@<DatabaseEndpoint>:5432/cameronspine"

npm run db:push
```

---

## Step 4 – Build & push the Docker image manually (first deploy)

```bash
ECR_URI=$(aws cloudformation describe-stacks \
  --stack-name cameronspine-ob-prod \
  --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryUri'].OutputValue" \
  --output text)

AWS_REGION=us-east-1   # change if needed
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Authenticate Docker to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push
docker build -t $ECR_URI:latest .
docker push $ECR_URI:latest

# Update ECS service to use the new image
aws ecs update-service \
  --cluster cameronspine-ob-cluster \
  --service cameronspine-ob-service \
  --force-new-deployment
```

---

## Step 5 – Deploy the PHI Lambda (first deploy)

```bash
cd server/aws
zip -r ../../phi-lambda.zip . --exclude "*.md" --exclude "views/*"
cd ../..

aws lambda update-function-code \
  --function-name cameronspine-ob-phi-handler \
  --zip-file fileb://phi-lambda.zip
```

---

## Step 6 – Configure GitHub Actions for CI/CD

### 6a. Add the GitHub OIDC provider to AWS (one-time)

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 6b. Set GitHub repository secrets and variables

Navigate to **Settings → Secrets and variables → Actions** in the GitHub
repository and add:

**Secrets**

| Name | Value |
|------|-------|
| `AWS_ROLE_ARN` | `GitHubActionsRoleArn` output from Step 2 |

**Variables**

| Name | Value |
|------|-------|
| `AWS_REGION` | `us-east-1` (or your region) |
| `ECR_REPOSITORY` | `cameronspine-ob` |
| `ECS_CLUSTER` | `cameronspine-ob-cluster` |
| `ECS_SERVICE` | `cameronspine-ob-service` |
| `ECS_TASK_DEFINITION` | `cameronspine-ob-task` |
| `CONTAINER_NAME` | `app` |
| `LAMBDA_FUNCTION_NAME` | `cameronspine-ob-phi-handler` |

After this, every push to `main` automatically builds and deploys the
application via `.github/workflows/deploy-aws.yml`.

---

## Step 7 – Add HTTPS (recommended)

1. Request or import a TLS certificate in **AWS Certificate Manager (ACM)**.
2. Add an HTTPS listener (port 443) to the ALB, attaching the ACM certificate.
3. Update the HTTP listener to redirect 80 → 443.
4. Update Cognito callback/sign-out URLs to use `https://`.

---

## Environment Variables Reference

See [`.env.example`](../.env.example) for the full list.

In production these are injected into the ECS task definition via
`ContainerDefinitions[].Environment` in the CloudFormation template.
**Do not commit secrets to source control.**

---

## Useful Commands

```bash
# View ECS service events
aws ecs describe-services \
  --cluster cameronspine-ob-cluster \
  --services cameronspine-ob-service \
  --query "services[0].events[:5]"

# Tail Lambda logs
aws logs tail /aws/lambda/cameronspine-ob-phi-handler --follow

# Tail ECS logs
aws logs tail /ecs/cameronspine-ob --follow
```
