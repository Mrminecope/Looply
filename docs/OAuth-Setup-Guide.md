# OAuth Setup Guide for Social Media App

This guide will help you configure Google and Apple OAuth providers in your Supabase project to enable social login functionality.

## Quick Setup

**IMPORTANT**: The OAuth buttons are currently disabled to prevent authentication errors. Once you've completed the OAuth setup in Supabase, you can enable them by:

1. Open `/utils/auth-config.ts`
2. Change `enableGoogle: false` to `enableGoogle: true` (if you configured Google)
3. Change `enableApple: false` to `enableApple: true` (if you configured Apple)
4. Save the file and the OAuth buttons will appear in your app

## Prerequisites

1. A Supabase project
2. Admin access to your Supabase dashboard
3. Google Cloud Console account (for Google OAuth)
4. Apple Developer account (for Apple OAuth)

## Supabase Configuration

### 1. Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Navigate to your project dashboard

### 2. Configure Authentication Settings

1. In your Supabase dashboard, navigate to **Authentication > Settings**
2. In the **Auth Settings** section:
   - Set **Site URL** to your application's URL (e.g., `https://your-app.com`)
   - Add redirect URLs under **Additional Redirect URLs**:
     - `https://your-app.com/auth/callback`
     - `http://localhost:3000/auth/callback` (for development)

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services > Library**
   - Search for "Google+ API" and enable it

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Fill in the required fields:
   - **App name**: Your app name
   - **User support email**: Your email
   - **App logo**: (optional)
   - **App domain**: Your app's domain
   - **Developer contact information**: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Save and continue

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure:
   - **Name**: Your app name
   - **Authorized JavaScript origins**: 
     - `https://your-supabase-project.supabase.co`
     - `http://localhost:3000` (for development)
   - **Authorized redirect URIs**:
     - `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Save and copy the **Client ID** and **Client Secret**

### Step 4: Configure in Supabase

1. In Supabase dashboard, go to **Authentication > Providers**
2. Enable **Google**
3. Enter your **Client ID** and **Client Secret**
4. Save the configuration

## Apple OAuth Setup

### Step 1: Configure Apple Developer Account

1. Sign in to [Apple Developer Console](https://developer.apple.com/)
2. Go to **Certificates, Identifiers & Profiles**

### Step 2: Create App ID

1. Click **Identifiers** > **+** button
2. Select **App IDs** and continue
3. Configure:
   - **Description**: Your app name
   - **Bundle ID**: Your app's bundle identifier (e.g., `com.yourcompany.yourapp`)
   - Enable **Sign In with Apple** capability
4. Save the App ID

### Step 3: Create Services ID

1. Click **Identifiers** > **+** button
2. Select **Services IDs** and continue
3. Configure:
   - **Description**: Your app name (web)
   - **Identifier**: Different from App ID (e.g., `com.yourcompany.yourapp.web`)
4. Enable **Sign In with Apple**
5. Configure domains and return URLs:
   - **Domains**: `your-supabase-project.supabase.co`
   - **Return URLs**: `https://your-supabase-project.supabase.co/auth/v1/callback`
6. Save the Services ID

### Step 4: Create Private Key

1. Go to **Keys** section
2. Click **+** button
3. Configure:
   - **Key Name**: Choose a name
   - Enable **Sign In with Apple**
   - Configure the key for your App ID
4. Download the private key (.p8 file)
5. Note the **Key ID**

### Step 5: Configure in Supabase

1. In Supabase dashboard, go to **Authentication > Providers**
2. Enable **Apple**
3. Configure:
   - **Services ID**: Your Services ID
   - **Secret Key**: Contents of the .p8 file
   - **Key ID**: Your Key ID
   - **Team ID**: Your Apple Developer Team ID
4. Save the configuration

## Email Configuration

### Enable Email Verification

1. In Supabase dashboard, go to **Authentication > Settings**
2. Under **User Signups**:
   - Enable **Email confirmations**
   - Set **Email confirmation redirect** to your app URL
3. Under **Auth** section:
   - Configure **SMTP settings** for custom email provider (optional)
   - Or use Supabase's default email service

### Configure Email Templates

1. Go to **Authentication > Email Templates**
2. Customize templates for:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**
   - **Email change**

## Testing Your Setup

### Test Email Authentication

1. Try signing up with email/password
2. Check that verification emails are sent
3. Test password reset functionality

### Test OAuth Providers

1. Try signing in with Google
2. Try signing in with Apple
3. Verify that user data is correctly stored in Supabase

## Common Issues and Solutions

### Google OAuth Issues

1. **"redirect_uri_mismatch"**: Ensure redirect URIs in Google Console match Supabase callback URL
2. **"invalid_client"**: Check that Client ID and Secret are correctly entered in Supabase
3. **"access_denied"**: Verify OAuth consent screen is properly configured

### Apple OAuth Issues

1. **"invalid_client"**: Verify Services ID is correctly configured
2. **"invalid_request"**: Check that private key and Key ID are correct
3. **"unauthorized_client"**: Ensure Team ID is correct

### Email Issues

1. **Emails not sending**: Check SMTP configuration or contact Supabase support
2. **Links not working**: Verify redirect URLs are correctly configured
3. **Email in spam**: Consider using custom SMTP provider

## Security Best Practices

1. **Use HTTPS** in production
2. **Validate redirect URLs** to prevent open redirect vulnerabilities
3. **Store secrets securely** - never expose them in client-side code
4. **Regularly rotate** OAuth secrets
5. **Monitor authentication logs** in Supabase dashboard

## Next Steps

After completing the OAuth setup:

1. Test all authentication flows thoroughly
2. Implement proper error handling in your app
3. Set up monitoring and logging
4. Consider implementing rate limiting
5. Review and update privacy policy and terms of service

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)