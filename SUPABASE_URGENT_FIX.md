# 🚨 URGENT: Supabase Configuration Fix Required

## The Problem

Your email verification is redirecting to Lovable instead of your local app because Supabase is configured with the wrong redirect URL.

## Immediate Solution

### Step 1: Configure Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `bleswtkoafdljurmythi`
3. Navigate to **Authentication** → **URL Configuration**
4. Update these settings:

```
Site URL: http://localhost:8080
Additional Redirect URLs:
- http://localhost:8080/auth/verify
- http://localhost:8080/auth/verification-handler
- http://localhost:8080/auth/callback
- http://localhost:8080/
```

### Step 2: Verify Email Templates

1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Click on "Confirm signup" template
3. Make sure the confirmation URL is set to:
   ```
   {{ .SiteURL }}/auth/verify?token_hash={{ .TokenHash }}&type=email
   ```

### Step 3: Test the Fix

1. Go to: `http://localhost:8080/auth`
2. Enter a real email address on the Sign Up tab
3. Click "Sign Up"
4. Check your email - the link should now point to `localhost:8080`

## Alternative: Manual Token Handling

If you can't change Supabase settings immediately, our code now handles both scenarios:

### Current Email Link (from Lovable redirect):

```
https://lovable.dev/login?redirect=...#access_token=XXX&refresh_token=YYY
```

### What Our App Does:

1. Detects the auth tokens in the URL
2. Extracts `access_token` and `refresh_token`
3. Sets up the session locally
4. Redirects to your dashboard

## Testing Instructions

### Test 1: With Fixed Supabase Config

1. Update Supabase settings as shown above
2. Use the email debug page to test signup
3. Email link should point directly to localhost:8080

### Test 2: With Current Broken Config

1. Click the verification link from email (goes to Lovable)
2. Copy the full URL from Lovable
3. Manually navigate to: `http://localhost:8080/auth/verify` and paste the hash part
4. Our app will extract the tokens and verify you

## Production Setup

For production deployment:

```
Site URL: https://yourdomain.com
Additional Redirect URLs:
- https://yourdomain.com/auth/verify
- https://yourdomain.com/auth/verification-handler
- https://yourdomain.com/auth/callback
```

## Troubleshooting

### If Email Still Goes to Lovable:

1. Check Supabase Auth settings are saved
2. Try using incognito browser
3. Clear browser cache
4. Wait 5-10 minutes for DNS propagation

### If Verification Fails:

1. Check browser console for detailed logs
2. Copy the full redirect URL and contact support
3. Try the manual token extraction method

## Need Immediate Help?

If you need to verify an account right now:

1. Get the verification email
2. Copy the full Lovable URL
3. Extract the `access_token` and `refresh_token` values
4. Go to: `http://localhost:8080/auth/verify#access_token=XXX&refresh_token=YYY&token_type=bearer&type=signup`

The most important fix is updating the Supabase Dashboard settings! 🎯
