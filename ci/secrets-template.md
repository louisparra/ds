<!--
What this file is:
Template and guidance listing the repository secrets used by CI workflows, what they are for, and who should provision them.

Who should edit it:
Infra team and Release Manager. Update when new secrets are required or ownership changes.

When to update (example):
Update when adding a new deployment provider (e.g., Netlify, Chromatic) or a new package registry.

Who must approve changes:
Engineering Lead and Security/Infra must approve secret-related changes.
-->

# CI Secrets Template — what to add to repository settings

This file documents repository secrets the CI workflows may require. **Do not** commit any secret values into the repo — add them via your GitHub repository's Settings → Secrets and variables → Actions.

## Required / recommended secrets

- `NPM_TOKEN`  
  - **Purpose:** Publish packages to npm or internal registry.  
  - **Used by:** [ci-generate-and-publish-artifacts.yml](../.github/workflows/ci-generate-and-publish-artifacts.yml) (publish job).  
  - **Owner / approver:** Release Manager, Eng Lead.  
  - **Notes:** Add as repository secret (not in PRs). Ensure token has the minimal scope necessary.

- `STORYBOOK_DEPLOY_TOKEN`  
  - **Purpose:** Deploy Storybook to a hosting provider or deploy service.  
  - **Used by:** [ci-storybook-deploy.yml](../.github/workflows/ci-storybook-deploy.yml) (deploy step).  
  - **Owner / approver:** Docs Owner / Release Manager.  
  - **Notes:** Provider-specific (Chromatic, Netlify, S3 + CI user). Prefer read-limited tokens if provider supports.

- `GH_PAGES_TOKEN`  
  - **Purpose:** Optional token for deploying to GitHub Pages (if using a deploy action requiring a token).  
  - **Used by:** [ci-storybook-deploy.yml](../.github/workflows/ci-storybook-deploy.yml) (alternative deploy path).  
  - **Owner / approver:** Infra / Release Manager.

- `CHROMATIC_PROJECT_TOKEN` *(optional)*  
  - **Purpose:** Upload Storybook to Chromatic for visual regression testing.  
  - **Used by:** [ci-storybook-deploy.yml](../.github/workflows/ci-storybook-deploy.yml) or separate Chromatic job.  
  - **Owner / approver:** QA / Release Manager.

- `STORAGE_SERVICE_KEY` *(optional, provider-specific)*  
  - **Purpose:** Deploy artifacts to internal storage bucket (S3, GCS) if required.  
  - **Used by:** deploy scripts.  
  - **Owner / approver:** Infra.

## Best practices & provisioning steps
1. Create tokens/accounts with minimal scopes required (least privilege).  
2. Store tokens as repo-level Actions secrets (Settings → Secrets) or use organization-level secret sharing for multiple repos.  
3. For any secret that will unlock publish/deploy: include an approval step in your release process and notify Release Manager after adding.  
4. Document token rotation policy and who owns rotation.

## Approvals & audit
- Any secret granting publish rights (e.g., `NPM_TOKEN`) must be added by Infra/Release Manager and communicated to the Design System Lead.  
- Security/Infra should audit secrets periodically (e.g., quarterly) and rotate tokens when personnel change.