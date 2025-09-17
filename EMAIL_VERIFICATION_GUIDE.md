# Email Verification Troubleshooting Guide

## Quick Setup Check

1. **Environment Variables** (check `.env` file):

   ```
   VITE_APP_URL="http://localhost:8080"  # Match your dev server port
   VITE_SUPABASE_URL="https://bleswtkoafdljurmythi.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="[your-key]"
   ```

2. **Development Server**: Make sure it's running on port 8080:
   ```bash
   npm run dev
   ```

## Testing Email Verification

### Step 1: Use the Debug Panel

1. Go to `/auth` page
2. Look for the "Authentication Debug Panel" in the top-left corner
3. Enter a **real email address you can access**
4. Click "Test Sign Up"
5. Open browser console (F12) to see detailed logs

### Step 2: Check Email Delivery

1. Check your email inbox for verification email
2. **Also check spam/junk folder** - this is very common
3. Email should come from your Supabase project
4. Subject line typically starts with "Confirm your signup"

### Step 3: Common Issues & Solutions

#### Issue: No Email Received

**Possible Causes:**

- Email in spam folder
- Invalid email address
- Supabase email not configured
- Rate limiting (too many attempts)

**Solutions:**

1. Check spam folder first
2. Try different email address
3. Wait 5-10 minutes between attempts
4. Use "Test Resend Verification" button

#### Issue: Email Goes to Lovable/Wrong Domain

**Solution:**

- Environment variable `VITE_APP_URL` should be `http://localhost:8080`
- Restart dev server after changing .env

#### Issue: Verification Link Doesn't Work

**Possible Causes:**

- Wrong redirect URL in Supabase
- Link expired (usually 24 hours)
- Link already used

**Solutions:**

1. Check console logs on verification page
2. Request new verification email
3. Ensure dev server is running on correct port

### Step 4: Manual Testing Flow

1. **Sign Up**: Use Auth Debug Panel or regular signup form
2. **Check Console**: Look for logs starting with "SignUp -"
3. **Check Email**: Look in inbox AND spam folder
4. **Click Link**: Should redirect to `localhost:8080/auth/verify`
5. **Verify Success**: Should show success message and redirect to login

### Step 5: Supabase Configuration Check

1. Go to Supabase Dashboard → Authentication → Settings
2. Check "Site URL" is set to `http://localhost:8080`
3. Check "Redirect URLs" includes `http://localhost:8080/auth/verify`
4. Ensure email confirmation is enabled

## Debug Console Commands

Open browser console and run these to debug:

```javascript
// Check environment variables
console.log("VITE_APP_URL:", import.meta.env.VITE_APP_URL);
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);

// Check current user state
import { supabase } from "@/integrations/supabase/client";
supabase.auth.getUser().then(console.log);

// Check current session
supabase.auth.getSession().then(console.log);
```

## Expected Console Logs

When testing signup, you should see logs like:

```
SignUp - Attempting to register user: { email: "test@example.com", redirectUrl: "http://localhost:8080/auth/verify" }
SignUp - Supabase response: { data: { user: { id: "...", email: "test@example.com", email_confirmed_at: null } } }
SignUp - Email verification required for user: [user-id]
```

## Production Setup

For production deployment:

1. Update `VITE_APP_URL` to your production domain
2. Update Supabase settings with production URLs
3. Remove debug panel (it only shows in development)

## Need Help?

If emails still aren't working after following this guide:

1. Share console logs from signup attempt
2. Confirm your email provider (Gmail, Outlook, etc.)
3. Try with a different email service
4. Check Supabase project email logs in dashboard
