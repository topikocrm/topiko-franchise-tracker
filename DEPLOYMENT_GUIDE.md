# Deployment Guide for topikopartner.com

## Files to Upload

Upload the following files to your hosting root directory (usually `public_html` or `www`):

```
/ (topikopartner.com root)
├── index.html (rename index-landing.html to index.html)
├── register/
│   └── index.html (the main questionnaire app)
├── api/
│   └── send-otp.php
├── admin/
│   └── index.html
├── *.png (all logo files in root)
└── .htaccess (if using Apache)
```

**IMPORTANT:** 
- Rename `index-landing.html` to `index.html` for the root domain
- The questionnaire app goes in `/register/index.html`

## Step-by-Step Deployment

### 1. Prepare Your Hosting

#### For Shared Hosting (cPanel/Plesk):
1. Log into your hosting control panel
2. Navigate to File Manager
3. Go to your domain's root directory (`public_html` or `www`)

#### Requirements:
- PHP 7.0 or higher
- cURL enabled (for SMS API)
- SSL certificate (recommended)

### 2. Upload Files

#### Method A: Using File Manager (cPanel)
1. Upload `index.html` to root directory
2. Create `api` folder
3. Upload `send-otp.php` to `api` folder
4. Upload all image files (*.png) to root
5. Create `admin` folder and upload admin/index.html

#### Method B: Using FTP
1. Connect via FTP client (FileZilla, etc.)
2. Server: `ftp.topikopartner.com`
3. Upload all files maintaining folder structure

#### Method C: Using Git (if available)
```bash
git clone https://github.com/yourusername/topiko-franchise-tracker.git
cd topiko-franchise-tracker
# Remove unnecessary files
rm -rf .git README.md vercel.json
```

### 3. Configure Permissions

Set proper permissions via FTP or File Manager:
```
index.html - 644
api/ folder - 755
api/send-otp.php - 644
images (*.png) - 644
```

### 4. Create .htaccess (for Apache servers)

Create `.htaccess` file in root directory:

```apache
# Enable CORS for API
<FilesMatch "\.(php)$">
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</FilesMatch>

# Force HTTPS (optional but recommended)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Prevent directory listing
Options -Indexes

# Custom error pages (optional)
ErrorDocument 404 /index.html
```

### 5. Update API Endpoint in index.html

The API endpoint is already set to `/api/send-otp` which will work with both:
- PHP hosting: `/api/send-otp.php`
- Node.js hosting: `/api/send-otp.js`

No changes needed if using standard setup.

### 6. Configure Supabase (Optional)

If you want to enable database saving:
1. Keep the existing Supabase configuration
2. Or update with your own Supabase project credentials

Currently configured:
```javascript
const SUPABASE_URL = 'https://uyaubwfmxmxelcshuyaf.supabase.co';
const SUPABASE_ANON_KEY = 'your-key-here';
```

### 7. Test Your Deployment

1. Visit `https://topikopartner.com`
2. Test the flow:
   - Enter contact details
   - Verify OTP (should receive SMS now)
   - Complete questionnaire
   - Check if data is saved

### 8. SSL Certificate

If not already configured:
1. Use free Let's Encrypt SSL via cPanel
2. Or contact your hosting provider
3. This is important for:
   - Security
   - SEO rankings
   - User trust

## Testing OTP Functionality

### Test Numbers:
- **8272500000** - Always uses OTP: `0827`
- **Any other number** - Receives actual SMS

### Master OTP:
- **0827** - Works for any number (emergency access)

## Troubleshooting

### OTP not received:
1. Check PHP error logs in cPanel
2. Verify cURL is enabled: Create `phpinfo.php`:
   ```php
   <?php phpinfo(); ?>
   ```
3. Check if MagicText account is active
4. Verify API credentials are correct

### Page not loading:
1. Check file permissions
2. Verify .htaccess syntax
3. Check PHP version (needs 7.0+)

### Database not saving:
- This is expected if Supabase is not configured
- Data will work locally without database
- Configure Supabase for persistent storage

## Domain Configuration

### DNS Settings (if not done):
Add these records in your domain registrar:

```
Type    Name    Value
A       @       Your-Server-IP
A       www     Your-Server-IP
```

### For Cloudflare Users:
1. Set SSL/TLS to "Full" or "Full (strict)"
2. Enable "Always Use HTTPS"
3. Add Page Rule: `*topikopartner.com/*` → Always Use HTTPS

## Monitoring

### Set up monitoring (optional):
1. UptimeRobot - Free uptime monitoring
2. Google Analytics - Add tracking code
3. Error tracking - Sentry or LogRocket

## Security Recommendations

1. **Remove test OTP in production:**
   - Comment out test number (8272500000) logic
   - Change or remove master OTP (0827)

2. **Add rate limiting:**
   - Limit OTP requests per phone number
   - Add CAPTCHA after failed attempts

3. **Secure admin panel:**
   - Add authentication to /admin
   - Use .htpasswd or PHP sessions

## Support

For issues:
1. Check hosting error logs
2. Browser console (F12) for JavaScript errors
3. Network tab for API failures

## Quick Checklist

- [ ] Files uploaded to correct directories
- [ ] Permissions set (644 for files, 755 for folders)
- [ ] SSL certificate active
- [ ] OTP API working (test with your number)
- [ ] Admin panel accessible at /admin
- [ ] Forms submitting correctly
- [ ] Mobile responsive working

## Alternative Hosting Options

### If using Netlify/Vercel:
- Remove `send-otp.php`
- Use `send-otp.js` only
- SMS won't work due to HTTP restriction

### If using VPS (DigitalOcean, AWS):
1. Install Node.js or PHP
2. Set up Nginx/Apache
3. Configure SSL with Certbot
4. Use PM2 for Node.js apps

---

**Note:** After deployment, test everything thoroughly before sharing the link publicly!