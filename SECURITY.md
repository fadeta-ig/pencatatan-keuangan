# Security Guidelines

## Environment Variables & Credentials

### Never Commit Sensitive Data

**NEVER commit these to version control:**
- `.env`, `.env.local`, `.env.production` files
- Service account JSON files
- Private keys
- API secrets
- Database passwords

### Proper Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your actual credentials** to `.env.local` (this file is gitignored)

3. **Never share credentials** in chat, email, or any public forum

### .gitignore Protection

The following patterns are already protected in `.gitignore`:
- `.env*` (except `.env.example`)
- `*-firebase-adminsdk-*.json`
- `serviceAccountKey.json`
- `service-account.json`

## If Credentials Are Exposed

If you accidentally expose credentials, take immediate action:

### 1. Rotate Firebase API Key (Client)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **General**
4. Under "Web API Key", click "Regenerate API Key"
5. Update `NEXT_PUBLIC_FIREBASE_API_KEY` in your `.env.local`

### 2. Rotate Service Account Key (Server)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the new JSON file
6. Update the following in your `.env.local`:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`
7. **Delete the old service account key** in Firebase Console

### 3. Delete Exposed Keys

After generating new credentials:
1. **Delete the old service account key** from Firebase Console
2. **Revoke any exposed API keys**
3. Update your `.env.local` with new credentials
4. Restart your development server

## Best Practices

### For Development
- Use `.env.local` for local development
- Never log environment variables
- Use environment variable validation at startup

### For Production
- Use your hosting platform's environment variable system (Vercel, etc.)
- Never hardcode credentials in source code
- Regularly rotate credentials (every 90 days recommended)
- Use different credentials for development and production

### Firebase Security Rules
Ensure your Firebase security rules are properly configured:
- Firestore rules should validate authentication
- Storage rules should restrict access appropriately
- Never use `allow read, write: if true` in production

## Checking for Exposed Credentials

Before committing code, run:
```bash
# Check for potential secrets
git diff --cached | grep -E "(API_KEY|SECRET|PASSWORD|PRIVATE_KEY)"

# View what will be committed
git status
```

## Emergency Contact

If you discover a security vulnerability, please:
1. **DO NOT** create a public GitHub issue
2. Rotate affected credentials immediately
3. Document the incident for team review
