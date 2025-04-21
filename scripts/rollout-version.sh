#!/bin/bash

# Exit on error
set -e

# Check if required environment variables are set
required_vars=(
  "R2_ACCESS_KEY_ID"
  "R2_SECRET_ACCESS_KEY"
  "CLOUDFLARE_ACCOUNT_ID"
  "CLOUDFLARE_RULES"
  "CLOUDFLARE_ZONE_ID"
  "CLOUDFLARE_RULESET_ID"
  "CLOUDFLARE_AUTH_EMAIL"
  "CLOUDFLARE_AUTH_KEY"
  "VERSION"
  "GITHUB_TOKEN"
  "GITHUB_REPOSITORY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: Required environment variable $var is not set"
    exit 1
  fi
done

# Get the latest successful run number for the version tag
echo "Getting latest workflow run number for version ${VERSION}..."
RUN_NUMBER=$(gh api -H "Accept: application/vnd.github+json" \
  /repos/${GITHUB_REPOSITORY}/actions/workflows/release-prod.yml/runs \
  --jq ".workflow_runs[] | select(.head_branch == \"${VERSION}\" and .conclusion == \"success\") | .run_number" \
  | head -n1)

if [ -z "$RUN_NUMBER" ]; then
  echo "No successful workflow run found for tag ${VERSION}"
  exit 1
fi

echo "Found run number: ${RUN_NUMBER}"

# Set AWS environment variables for R2
export AWS_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
export AWS_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
export AWS_ENDPOINT_URL=https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com

# Update updates.json on R2
echo "Updating updates.json on R2..."
# aws s3 rm s3://shinkai-download/shinkai-desktop/binaries/production/updates.json --endpoint-url https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com
aws s3 cp s3://shinkai-download/shinkai-desktop/binaries/production/updates-next.json s3://shinkai-download/shinkai-desktop/binaries/production/updates.json --endpoint-url https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com

# Update Cloudflare Ruleset
echo "Updating Cloudflare Ruleset..."
FULL_VERSION="${VERSION}.${RUN_NUMBER}"

# Make the sed command compatible with both macOS and Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS (BSD) sed
  RULES=$(echo "${CLOUDFLARE_RULES}" | sed -E "s/SHINKAI_RELEASE_VERSION/${FULL_VERSION}/g")
else
  # Linux (GNU) sed
  RULES=$(echo "${CLOUDFLARE_RULES}" | sed "s/SHINKAI_RELEASE_VERSION/${FULL_VERSION}/g")
fi

curl -L -X PUT "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/rulesets/${CLOUDFLARE_RULESET_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Auth-Email: ${CLOUDFLARE_AUTH_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_AUTH_KEY}" \
  --data "{
    \"description\": \"\",
    \"id\": \"${CLOUDFLARE_RULESET_ID}\",
    \"kind\": \"zone\",
    \"name\": \"default\",
    \"phase\": \"http_request_dynamic_redirect\",
    \"rules\": ${RULES}
  }"

echo "Rollout completed successfully!" 