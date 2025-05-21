# Deployment Guide for cPanel

This guide will help you deploy your Next.js application to a cPanel hosting environment.

## Prerequisites

- A cPanel hosting account with Node.js support
- SSH access to your hosting (recommended)
- MySQL database (already set up using the database setup instructions)

## Deployment Steps

### 1. Prepare Your Application

1. Build your application locally:
   \`\`\`bash
   npm run build
   \`\`\`

2. Create a `.env` file with your production environment variables:
   \`\`\`
   DB_HOST=localhost
   DB_USER=cpanelusername_dbuser
   DB_PASSWORD=your-database-password
   DB_NAME=cpanelusername_apartmentpro
   JWT_SECRET=your-secure-random-string
   \`\`\`

### 2. Upload Files to cPanel

#### Option 1: Using File Manager

1. Log in to your cPanel account
2. Open the File Manager
3. Navigate to the directory where you want to deploy your application
4. Upload the following:
   - The `.next` folder
   - The `node_modules` folder (or install dependencies on the server)
   - The `public` folder
   - The `package.json` and `package-lock.json` files
   - The `.env` file
   - Any other necessary files

#### Option 2: Using FTP

1. Use an FTP client like FileZilla to connect to your server
2. Upload the same files as mentioned above

### 3. Set Up Node.js App in cPanel

If your cPanel hosting supports Node.js applications:

1. Go to the "Setup Node.js App" section in cPanel
2. Create a new Node.js application
3. Set the application path to your uploaded files
4. Set the application URL
5. Set the Node.js version (use the same version you developed with)
6. Set the application startup file to `node_modules/.bin/next start`
7. Set environment variables if needed
8. Start the application

### 4. Alternative: Deploy as Static Export

If your cPanel hosting doesn't support Node.js or you prefer a static deployment:

1. Modify your `next.config.js` to enable static exports:
   \`\`\`js
   module.exports = {
     output: 'export',
   }
   \`\`\`

2. Build your application with the static export:
   \`\`\`bash
   npm run build
   \`\`\`

3. Upload the contents of the `out` directory to your cPanel hosting

### 5. Set Up Database

1. Follow the database setup instructions in the `database/setup-instructions.md` file
2. Import the schema from `database/schema.sql`

### 6. Configure .htaccess (if needed)

If you're using Apache (common with cPanel), create an `.htaccess` file in your root directory:

\`\`\`
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
\`\`\`

### 7. Test Your Deployment

1. Visit your application URL
2. Test all functionality, especially database operations
3. Check for any errors in the server logs

### 8. Troubleshooting

- If you encounter database connection issues, verify your database credentials and permissions
- If you see 500 errors, check the server error logs in cPanel
- For Node.js application issues, check the Node.js application logs in cPanel

### 9. Maintenance

- Set up regular database backups using cPanel's backup tools
- Monitor your application's performance and logs
- Update your application as needed by repeating the deployment process
