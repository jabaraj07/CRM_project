# Git Setup Guide

This guide will help you initialize Git and push your CRM project to a repository.

## Step 1: Initialize Git Repository

Open terminal/command prompt in the project root directory (`crm-project`) and run:

```bash
# Initialize git repository
git init

# Add all files (respecting .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: CRM full-stack application"
```

## Step 2: Create a Remote Repository

### Option A: GitHub

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it (e.g., `crm-project` or `crm-system`)
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Option B: GitLab

1. Go to [GitLab](https://gitlab.com) and sign in
2. Click "New project" → "Create blank project"
3. Name it and set visibility
4. Click "Create project"

### Option C: Bitbucket

1. Go to [Bitbucket](https://bitbucket.org) and sign in
2. Click "Create" → "Repository"
3. Name it and set visibility
4. Click "Create repository"

## Step 3: Connect Local Repository to Remote

After creating the remote repository, you'll get a URL. Use it to connect:

```bash
# Add remote repository (replace with your actual URL)
git remote add origin https://github.com/yourusername/crm-project.git

# Or if using SSH:
# git remote add origin git@github.com:yourusername/crm-project.git

# Verify remote was added
git remote -v
```

## Step 4: Push to Remote Repository

```bash
# Push to remote repository
git branch -M main
git push -u origin main
```

If you're using `master` as default branch:

```bash
git branch -M master
git push -u origin master
```

## Step 5: Verify

1. Go to your repository on GitHub/GitLab/Bitbucket
2. Verify all files are uploaded (except those in .gitignore)
3. Check that `.env` files are NOT in the repository (they should be ignored)

## Important Notes

### Files That Are Excluded (via .gitignore)

- `node_modules/` - Dependencies (will be installed via `npm install`)
- `.env` files - Environment variables (contains sensitive data)
- `build/` and `dist/` - Build outputs
- IDE files (`.vscode/`, `.idea/`)
- Log files

### Before Sharing/Pushing

1. **Never commit `.env` files** - They contain sensitive information (database URLs, JWT secrets)
2. **Verify `.gitignore` is working** - Run `git status` and ensure `.env` files don't appear
3. **Create `.env.example` files** (optional but recommended):
   - `crm-backend/.env.example` - Template for backend environment variables
   - Users can copy this to `.env` and fill in their values

### Creating .env.example Files (Optional)

If you want to help others set up the project:

```bash
# In crm-backend directory
# Create .env.example with placeholder values
```

Example `.env.example`:
```env
# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/crm_db
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/crm_db

# JWT Secret (generate a random string)
JWT_SECRET=your-secret-key-here-change-this-in-production
```

## Common Git Commands

```bash
# Check status
git status

# Add specific files
git add <filename>

# Commit changes
git commit -m "Your commit message"

# Push changes
git push

# Pull latest changes
git pull

# View commit history
git log

# Create a new branch
git checkout -b feature-branch-name

# Switch branches
git checkout main
```

## Troubleshooting

### If you accidentally committed .env file:

```bash
# Remove from git (but keep local file)
git rm --cached crm-backend/.env

# Commit the removal
git commit -m "Remove .env from repository"

# Push the change
git push
```

### If you need to update .gitignore:

```bash
# Edit .gitignore file
# Then run:
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
git push
```

## Security Checklist

Before pushing to a public repository:

- [ ] `.env` files are in `.gitignore`
- [ ] No API keys or secrets in code
- [ ] No database credentials in code
- [ ] No personal information in commits
- [ ] `.gitignore` is properly configured
- [ ] Run `git status` to verify sensitive files are ignored

