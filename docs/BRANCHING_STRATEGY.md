# Git Branching Strategy

This document outlines the branching strategy for the PocketShop project to ensure a clean, organized, and collaborative development workflow.

## Branch Types

### 1. `main` (Production)
- **Purpose**: Production-ready code
- **Protection**: Protected branch, requires pull request reviews
- **Deployment**: Automatically deployed to production (Vercel)
- **Rule**: Only merge from `develop` or hotfix branches

### 2. `develop` (Development)
- **Purpose**: Integration branch for features
- **Protection**: Protected branch, requires pull request reviews
- **Deployment**: Automatically deployed to staging environment
- **Rule**: Merge feature branches here before going to `main`

### 3. `feature/*` (Feature Branches)
- **Purpose**: New features or enhancements
- **Naming**: `feature/feature-name` (e.g., `feature/vendor-dashboard`)
- **Source**: Branch from `develop`
- **Merge**: Back into `develop` via pull request
- **Examples**:
  - `feature/vendor-onboarding`
  - `feature/order-management`
  - `feature/payment-integration`

### 4. `bugfix/*` (Bug Fix Branches)
- **Purpose**: Fix bugs found in `develop`
- **Naming**: `bugfix/bug-description` (e.g., `bugfix/login-error`)
- **Source**: Branch from `develop`
- **Merge**: Back into `develop` via pull request

### 5. `hotfix/*` (Hotfix Branches)
- **Purpose**: Critical fixes for production
- **Naming**: `hotfix/issue-description` (e.g., `hotfix/payment-failure`)
- **Source**: Branch from `main`
- **Merge**: Back into both `main` and `develop` via pull requests
- **Use**: Only for urgent production fixes

### 6. `release/*` (Release Branches)
- **Purpose**: Prepare for a new production release
- **Naming**: `release/v1.x.x` (e.g., `release/v1.2.0`)
- **Source**: Branch from `develop`
- **Merge**: Back into both `main` and `develop`
- **Use**: For version releases with version bumps and release notes

## Workflow Example

### Feature Development
```bash
# 1. Update develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/vendor-dashboard

# 3. Make changes and commit
git add .
git commit -m "feat: add vendor dashboard UI"

# 4. Push and create PR
git push origin feature/vendor-dashboard
# Create PR: feature/vendor-dashboard -> develop

# 5. After PR approval and merge, delete branch
git checkout develop
git pull origin develop
git branch -d feature/vendor-dashboard
```

### Hotfix Workflow
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/payment-failure

# 2. Fix the issue
git add .
git commit -m "fix: resolve payment processing error"

# 3. Create PRs to both main and develop
git push origin hotfix/payment-failure
# Create PR: hotfix/payment-failure -> main
# Create PR: hotfix/payment-failure -> develop
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

### Examples:
```
feat: add vendor registration form
fix: resolve authentication token expiration
docs: update API documentation
refactor: simplify order status logic
test: add unit tests for product service
```

## Branch Protection Rules

### `main` Branch
- ✅ Require pull request reviews (at least 1 approver)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ No force pushes
- ✅ No deletion

### `develop` Branch
- ✅ Require pull request reviews (at least 1 approver)
- ✅ Require status checks to pass
- ✅ No force pushes
- ✅ No deletion

## Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: Include:
   - What changes were made
   - Why the changes were necessary
   - Any breaking changes
   - Screenshots (for UI changes)
   - Testing instructions
3. **Size**: Keep PRs focused and small (< 400 lines when possible)
4. **Reviews**: At least one approval required
5. **Status Checks**: All CI checks must pass
6. **Labels**: Use labels to categorize PRs (bug, feature, documentation, etc.)

## Best Practices

1. **Keep branches updated**: Regularly rebase or merge `develop` into your feature branch
2. **Small, focused commits**: Make atomic commits that represent logical changes
3. **Clear naming**: Use descriptive branch and commit names
4. **Delete merged branches**: Clean up branches after they're merged
5. **Communicate**: Use PR descriptions and comments to communicate changes
6. **Test before PR**: Ensure code passes all tests and linting before creating PR

## Emergency Procedures

### If main is broken:
1. Create hotfix branch from `main`
2. Fix the issue
3. Test thoroughly
4. Merge to `main` immediately
5. Merge back to `develop`
6. Deploy to production

### If develop is broken:
1. Create bugfix branch from `develop`
2. Fix the issue
3. Test thoroughly
4. Merge back to `develop`

## Questions?

For questions about branching strategy, contact the project maintainer or create an issue.

