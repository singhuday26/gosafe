# GoSafe Authentication Workflow Documentation

## Overview

GoSafe implements a comprehensive authentication system using Supabase Auth with role-based access control. This document outlines the complete sign-in/sign-up workflow, including email verification, role assignment, and post-authentication redirects.

## Authentication Flow

### 1. Sign Up Process

#### User Journey:

1. **Access Sign Up Form**: User navigates to `/auth` and selects "Sign Up" tab
2. **Enter Details**: User provides:
   - Email address
   - Password (with confirmation)
   - Full name
   - Phone number (optional)
   - Role selection (Tourist/Authority/Admin)
   - Organization (required for Authority/Admin roles)

#### Backend Process:

1. **Supabase Sign Up**: System calls `supabase.auth.signUp()` with:

   - Email and password
   - User metadata containing profile information
   - Email redirect URL: `${window.location.origin}/auth/verify`

2. **Email Verification Required**:

   - Supabase sends verification email to user
   - User must click verification link to activate account
   - Account remains inactive until email is verified

3. **Post-Verification Profile Creation**:
   - After successful email verification at `/auth/verify`
   - System automatically creates user profile in `profiles` table
   - Profile includes: user_id, full_name, role, phone_number, organization

#### Success Flow:

- ✅ Email verification sent → User notified to check email
- ✅ Email verified → Profile created → Redirect to login with success message
- ✅ User can now sign in

#### Error Handling:

- Invalid email format → Form validation error
- Password mismatch → Client-side validation
- Duplicate email → Supabase error handling
- Network issues → Retry mechanism with user feedback

### 2. Sign In Process

#### User Journey:

1. **Access Sign In Form**: User navigates to `/auth` (default tab)
2. **Enter Credentials**: User provides email and password
3. **Authentication**: System validates credentials with Supabase

#### Backend Process:

1. **Supabase Authentication**: `supabase.auth.signInWithPassword()`
2. **Session Creation**: Supabase creates authenticated session
3. **Role Retrieval**: System fetches user role from `profiles` table
4. **Role-Based Redirect**:
   - Tourist → `/tourist`
   - Authority → `/authority`
   - Admin → `/admin`

#### Success Flow:

- ✅ Valid credentials → Session created → Role-based redirect
- ✅ User lands on appropriate dashboard
- ✅ Session persists across browser sessions

#### Error Handling:

- Invalid credentials → Clear error message
- Unverified email → Prompt to check email
- Network issues → Retry with exponential backoff
- Account locked/suspended → Appropriate messaging

### 3. Email Verification Process

#### Verification Flow:

1. **Email Link Click**: User clicks verification link from email
2. **Token Validation**: System validates token at `/auth/verify`
3. **Account Activation**: Supabase confirms email
4. **Profile Creation**: Automatic profile creation with user metadata
5. **Success Redirect**: User redirected to login with success message

#### Verification States:

- **Loading**: Token being validated
- **Success**: Email verified, profile created, redirecting to login
- **Already Verified**: User already verified, redirect to login
- **Expired**: Verification link expired, option to resend
- **Invalid**: Invalid/malformed token, option to resend
- **Error**: Unexpected error during verification

### 4. Password Reset Process

#### Reset Flow:

1. **Forgot Password**: User clicks "Forgot Password" on sign-in form
2. **Email Submission**: User enters email address
3. **Reset Email Sent**: Supabase sends password reset email
4. **Reset Link**: User clicks reset link → Redirects to `/auth/reset-password`
5. **New Password**: User sets new password
6. **Confirmation**: Password updated successfully

### 5. Role-Based Access Control

#### User Roles:

- **Tourist**: Default role for regular users

  - Access: Tourist dashboard, personal profile, emergency features
  - Restrictions: Cannot access authority or admin features

- **Authority**: Law enforcement/police users

  - Access: Authority dashboard, case management, emergency response
  - Additional Requirements: Organization name required

- **Admin**: System administrators
  - Access: Admin dashboard, system configuration, user management
  - Additional Requirements: Organization name required

#### Route Protection:

- **ProtectedRoute Component**: Wraps all authenticated routes
- **Role Validation**: Checks user role against required roles
- **Automatic Redirects**: Unauthorized users redirected to appropriate dashboard
- **Loading States**: Proper loading indicators during auth checks

### 6. Session Management

#### Session Persistence:

- **Local Storage**: Sessions stored in browser localStorage
- **Auto Refresh**: Supabase automatically refreshes tokens
- **Cross-Tab Sync**: Session state synchronized across browser tabs

#### Session Events:

- **Auth State Changes**: Real-time session updates
- **Automatic Logout**: Expired sessions handled gracefully
- **Reconnection**: Automatic re-authentication on network recovery

### 7. Security Features

#### Authentication Security:

- **Email Verification**: Required for account activation
- **Password Requirements**: Enforced client and server-side
- **Rate Limiting**: Supabase built-in rate limiting
- **Token Security**: JWT tokens with expiration

#### Data Protection:

- **Row Level Security (RLS)**: Database-level access control
- **Profile Isolation**: Users can only access their own data
- **Role-Based Permissions**: Granular access control per role

### 8. Error Handling & User Experience

#### User Feedback:

- **Toast Notifications**: Real-time feedback for all auth actions
- **Loading States**: Clear indicators during async operations
- **Error Messages**: User-friendly error descriptions
- **Success Confirmations**: Positive feedback for completed actions

#### Edge Cases:

- **Network Interruptions**: Graceful handling with retry options
- **Browser Issues**: Fallback mechanisms for localStorage issues
- **Multiple Sessions**: Proper handling of concurrent sessions
- **Account Recovery**: Comprehensive password reset flow

### 9. Integration Points

#### Frontend Components:

- **AuthContext**: Centralized authentication state management
- **ProtectedRoute**: Route-level access control
- **Auth Page**: Unified sign-in/sign-up interface
- **EmailVerify**: Email verification handling

#### Backend Integration:

- **Supabase Auth**: Primary authentication service
- **Database Profiles**: User profile storage and management
- **Real-time Updates**: Live session state synchronization

### 10. Testing & Validation

#### Test Scenarios:

- ✅ New user sign up with email verification
- ✅ Existing user sign in with role-based redirect
- ✅ Password reset flow
- ✅ Invalid credentials handling
- ✅ Session persistence and recovery
- ✅ Role-based access control
- ✅ Email verification edge cases

#### Validation Checks:

- Form validation on client and server
- Email format validation
- Password strength requirements
- Role selection validation
- Required field validation

## Configuration Requirements

### Supabase Setup:

1. **Email Confirmation**: Must be enabled in Supabase dashboard
2. **Site URL**: Configure correct site URL for redirects
3. **Email Templates**: Customize verification and reset emails
4. **SMTP Configuration**: Set up email delivery service

### Environment Variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### Database Schema:

- `profiles` table with proper RLS policies
- User metadata structure for profile creation
- Role-based access control policies

## Troubleshooting

### Common Issues:

1. **Email not received**: Check spam folder, verify SMTP configuration
2. **Verification link expired**: Request new verification email
3. **Role not assigned**: Check profile creation after verification
4. **Redirect issues**: Verify route configuration and role mappings

### Debug Steps:

1. Check browser console for auth-related errors
2. Verify Supabase configuration in dashboard
3. Test email delivery and templates
4. Validate database RLS policies
5. Check network connectivity and CORS settings

## Future Enhancements

### Planned Features:

- Social authentication (Google, Facebook)
- Multi-factor authentication (MFA)
- Account linking and merging
- Advanced password policies
- Session management dashboard
- Audit logging for security events

### Scalability Considerations:

- Rate limiting for auth endpoints
- Session store optimization
- Email delivery queue management
- Database connection pooling
- CDN for static auth assets
