# 🔐 URGENT: API Key Security Setup Required

## ⚠️ IMPORTANT SECURITY NOTICE

Your Google Maps API key has been added to the environment file, but **MUST be secured immediately** to prevent unauthorized usage.

### Current Risk
Without restrictions, your API key can be used by anyone who finds it, which can:
- Drain your Google Cloud credits
- Incur unexpected charges
- Compromise your application

## ✅ Required Steps (DO THIS NOW)

### 1. Go to Google Cloud Console
👉 **Open:** [https://console.cloud.google.com/](https://console.cloud.google.com/)

### 2. Navigate to API Credentials
1. Click on the hamburger menu (☰) in the top left
2. Go to **"APIs & Services"** → **"Credentials"**
3. Find your API key: `AIzaSyCYH9pmSWHxMh8yyEuzhf3y--KBmH-PIR4`

### 3. Click "Edit API Key" (Pencil Icon)

### 4. Application Restrictions

**Select "HTTP referrers (websites)"** and add these:

#### For Development:
```
http://localhost:3000/*
https://localhost:3000/*
localhost:3000/*
```

#### For Production (replace with your actual domain):
```
https://yourdomain.com/*
https://www.yourdomain.com/*
```

#### Optional - Subdomain wildcard:
```
https://*.yourdomain.com/*
```

### 5. API Restrictions

**Select "Restrict key"** and check ONLY:
- ✅ **Places API (New)**
- ✅ **Maps JavaScript API** (if you plan to use maps later)

### 6. Click "Save"

### 7. Verify Restrictions

After saving, verify that:
- Application restrictions are set to HTTP referrers
- Only your domains are listed
- API restrictions are enabled
- Only Places API is selected

## 🎯 Additional Security Best Practices

### In Your Code
- ✅ Never commit `.env.local` to Git
- ✅ Add `.env.local` to `.gitignore` (already done)
- ✅ Rotate keys if accidentally exposed
- ✅ Use different keys for dev and production

### Monitoring
- ✅ Set up billing alerts in Google Cloud Console
- ✅ Monitor API usage regularly
- ✅ Review error logs for suspicious activity

### Production Checklist
- [ ] API key restricted to production domain
- [ ] HTTPS enabled
- [ ] Billing alerts configured
- [ ] Usage limits set (optional)
- [ ] Monitoring dashboard set up

## 📊 How to Check Your Security

After setting up restrictions, test in different environments:

### ✅ Should Work:
- Your localhost development
- Your production domain

### ❌ Should NOT Work:
- Other developers' localhost
- Any other domains
- Direct API calls from elsewhere

## 🆘 If Your Key Is Compromised

If you suspect your API key has been exposed:

1. **Immediately** go to Google Cloud Console
2. Delete or regenerate the API key
3. Update your `.env.local` file with the new key
4. Review billing for any unauthorized usage
5. Set up stricter restrictions for the new key

## 📚 Additional Resources

- [Google API Key Security](https://cloud.google.com/docs/authentication/api-keys)
- [Setting API key restrictions](https://cloud.google.com/docs/authentication/api-keys#adding_http_restrictions_credentials)
- [Best practices guide](https://cloud.google.com/docs/authentication/api-keys#securing_an_api_key)

## ⏰ Action Required

**PLEASE COMPLETE THE API KEY RESTRICTIONS WITHIN THE NEXT 24 HOURS**

This is critical to protect your project from unauthorized usage and potential costs.

---

**Next:** After securing your API key, test the location features by running `npm run dev` in the frontend directory.

