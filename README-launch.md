# PixelCapture Pro - Vercel Deployment Guide

This document provides detailed instructions for deploying PixelCapture Pro to Vercel platform.

## Prerequisites

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment - Updated branding and config"
git push origin main
```

### 2. Required Third-party Service Accounts
- **Vercel Account** (for deployment)
- **Clerk Account** (user authentication)
- **Stripe Account** (payment processing)
- **Supabase Account** (database)
- **Resend Account** (email service)
- **GitHub Account** (code hosting and automation)

## Vercel Deployment Process

### Step 1: Login to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign in with your GitHub account

### Step 2: Import Project
1. Click **"New Project"**
2. Select your GitHub repository: `pixel-capture`
3. Click **"Import"**

### Step 3: Configure Project Settings
- **Project Name**: `pixel-capture`
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `.` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 4: Configure Environment Variables
Before deployment, click **"Environment Variables"** and add:

#### Authentication Service (Clerk)
```bash
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_public_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
CLERK_WEBHOOK_SECRET=whsec_your_clerk_webhook_secret
```

#### Payment Service (Stripe)
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_public_key
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_your_price_id
```

#### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ_your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJ_your_supabase_service_key
SUPABASE_ACCESS_TOKEN=sbp_your_supabase_access_token
```

#### Email Service (Resend)
```bash
RESEND_API_KEY=re_your_resend_api_key
EMAIL_DOMAIN=send.winstontech.me
EMAIL_FROM_ADDRESS=noreply@winstontech.me
```

#### Application Configuration
```bash
BILLING_PLAN_ENV=prod
CRON_API_KEY=your_uuid_key
NEXT_PUBLIC_APP_URL=https://your_domain.vercel.app
```

#### Optional - Error Monitoring (Sentry)
```bash
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build completion (usually 2-5 minutes)
3. If build fails, check error logs and fix issues

## Post-Deployment Configuration

### Step 6: Update Third-party Service Configurations

#### Update Clerk Configuration
1. Login to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Add production domain in **"Domains"**: `https://your_domain.vercel.app`
4. Update allowed redirect URLs

#### Update Stripe Configuration
1. Login to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **"Developers" → "Webhooks"**
3. Add new webhook endpoint:
   ```
   https://your_domain.vercel.app/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `invoice.payment_succeeded`

#### Update Supabase Configuration
1. Login to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **"Settings" → "API"**
4. Add allowed domain in **"URL Configuration"**

### Step 7: Setup Automated Cron Jobs

#### Create GitHub Actions Workflow
Create `.github/workflows/cron.yml` in project root:

```yaml
name: Daily Subscription Check
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC (10 AM Beijing Time)
  workflow_dispatch:    # Allow manual trigger

jobs:
  check-subscriptions:
    runs-on: ubuntu-latest
    steps:
      - name: Call Vercel Cron API
        run: |
          curl -X GET "https://your_domain.vercel.app/api/cron/check-subscriptions" \
            -H "Authorization: Bearer ${{ secrets.CRON_API_KEY }}" \
            -f
```

#### Setup GitHub Secret
1. Go to GitHub repository
2. Click **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Add:
   - **Name**: `CRON_API_KEY`
   - **Secret**: Your UUID key (same as in Vercel)

#### Push GitHub Actions Configuration
```bash
git add .github/workflows/cron.yml
git commit -m "Add automated subscription check task"
git push origin main
```

## Verification and Testing

### Step 8: Functionality Testing

#### Basic Functionality Tests
1. **Visit website**: `https://your_domain.vercel.app`
2. **Test page loading**: Homepage, features, pricing pages
3. **Test registration**: Create new account
4. **Test login**: Login with existing account
5. **Test dashboard**: Access user dashboard

#### Payment Flow Testing
1. **Visit pricing page**
2. **Click purchase button**
3. **Use Stripe test card**: `4242 4242 4242 4242`
4. **Complete payment flow**
5. **Verify payment success page**

#### License Functionality Testing
1. **Check email**: Should receive license email after payment
2. **Test license activation**: Enter license key in dashboard
3. **Verify Pro features**: Confirm user status changes to Pro

#### Email System Testing
```bash
# For development environment, test email API
curl -X POST "https://your_domain.vercel.app/api/test-email" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Step 9: Webhook Testing

#### Test Stripe Webhook
1. Find your webhook in Stripe Dashboard
2. Click **"Send test webhook"**
3. Select `checkout.session.completed` event
4. Check Vercel Functions logs to confirm receipt

#### Test Cron Job
```bash
# Manually trigger cron job
curl -X GET "https://your_domain.vercel.app/api/cron/check-subscriptions"
```

Or manually run workflow in GitHub Actions.

## Security Configuration

### Step 10: Domain and SSL Configuration

#### Custom Domain (Optional)
1. In Vercel project settings, click **"Domains"**
2. Add your custom domain
3. Configure DNS records pointing to Vercel:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

#### SSL Certificate
- Vercel automatically provides free SSL certificates
- Ensure all HTTP requests auto-redirect to HTTPS
- Check certificate status shows "Valid" in domain settings

### Step 11: Security Checklist
- [ ] All sensitive environment variables are set
- [ ] Webhook endpoints added to third-party services
- [ ] API key permissions set correctly (only necessary permissions)
- [ ] No hardcoded sensitive information in code
- [ ] CORS policy configured correctly

## Monitoring and Maintenance

### Step 12: Setup Monitoring

#### Vercel Analytics
1. Enable Analytics in Vercel project settings
2. Monitor website traffic and performance metrics

#### Error Monitoring (if using Sentry)
1. Check error reports in Sentry project
2. Setup error notification rules

#### GitHub Actions Monitoring
1. Regularly check Actions execution status
2. Email notifications sent if cron jobs fail

### Step 13: Log Monitoring
```bash
# View Vercel Functions logs
# In Vercel Dashboard → Functions → View Function Logs
```

Monitor these logs:
- User registration/login errors
- Payment processing errors
- Email sending failures
- License activation issues

## Troubleshooting Common Issues

### Build Failures
**Problem**: Errors during build process
**Solutions**:
1. Check dependency versions in package.json
2. Ensure all environment variables are correctly set
3. Review specific error messages in build logs
4. Check for TypeScript type errors

### Runtime Errors
**Problem**: Deployment succeeds but runtime errors occur
**Solutions**:
1. Check Vercel Functions logs
2. Confirm database connection is working
3. Verify third-party service API keys
4. Check environment variable spelling

### Email Sending Failures
**Problem**: Users not receiving emails
**Solutions**:
1. Verify Resend API key is valid
2. Check sender domain verification status
3. Confirm emails are not in spam folder
4. Review sending logs in Resend Dashboard

### Payment Flow Issues
**Problem**: Stripe payments cannot complete
**Solutions**:
1. Check Stripe webhook configuration
2. Verify price ID is correct
3. Confirm webhook secret matches
4. Review event logs in Stripe Dashboard

### Cron Job Not Executing
**Problem**: Automated subscription checks not running
**Solutions**:
1. Check GitHub Actions execution history
2. Verify CRON_API_KEY is set correctly
3. Confirm cron expression syntax is correct
4. Manually trigger test workflow

## Deployment Completion Checklist

### Functionality Checks
- [ ] Website accessible normally
- [ ] Homepage loads correctly
- [ ] User registration/login working
- [ ] Payment flow working
- [ ] License activation working
- [ ] Email sending working
- [ ] User dashboard functions working

### Technical Checks
- [ ] All environment variables set
- [ ] Webhooks receiving correctly
- [ ] Cron jobs executing normally
- [ ] SSL certificate valid
- [ ] Third-party service configurations updated

### Monitoring Checks
- [ ] Vercel Analytics enabled
- [ ] Error monitoring working normally
- [ ] GitHub Actions status normal
- [ ] Log recording clear and readable

## Deployment Complete

Congratulations! Your **PixelCapture Pro SaaS service** is now successfully deployed to Vercel and running in production.

### Next Steps Recommendations
1. **Test complete user flow**: From registration to purchase to usage
2. **Monitor system performance**: Watch response times and error rates
3. **Collect user feedback**: Optimize user experience
4. **Regular data backups**: Ensure data security
5. **Plan feature updates**: Iterate based on user needs

### Technical Support
If you encounter issues during deployment:
1. Review Vercel official documentation
2. Check project GitHub Issues
3. Review documentation for each third-party service
4. Contact respective service technical support

---

**Deployment Date**: `[Fill in deployment completion date]`  
**Deployment Domain**: `[Fill in actual domain]`  
**Version**: `v1.0.0`