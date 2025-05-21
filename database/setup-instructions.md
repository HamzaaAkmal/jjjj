# Database Setup Instructions for cPanel

Follow these steps to set up your database on cPanel:

## 1. Create a Database

1. Log in to your cPanel account
2. Navigate to the "MySQL Databases" section
3. Create a new database named `apartmentpro` (or your preferred name)
4. Note: The full database name will be `cpanelusername_apartmentpro`

## 2. Create a Database User

1. In the same "MySQL Databases" section, scroll down to "MySQL Users"
2. Create a new user with a secure password
3. Note: The full username will be `cpanelusername_dbuser`

## 3. Assign User to Database

1. Scroll down to "Add User To Database"
2. Select the user and database you created
3. Assign "ALL PRIVILEGES" to the user

## 4. Import Database Schema

1. Navigate to "phpMyAdmin" in cPanel
2. Select your database from the left sidebar
3. Click on the "Import" tab
4. Upload the `schema.sql` file from this project
5. Click "Go" to import the schema

## 5. Configure Environment Variables

Create a `.env` file in your project root with the following variables:

\`\`\`
DB_HOST=localhost
DB_USER=cpanelusername_dbuser
DB_PASSWORD=your-database-password
DB_NAME=cpanelusername_apartmentpro
JWT_SECRET=your-secure-random-string
\`\`\`

Replace the values with your actual cPanel database credentials.

## 6. Deploy Your Application

1. Upload your application files to your cPanel hosting
2. Make sure the `.env` file is included but not publicly accessible
3. Set up Node.js if your hosting supports it, or use a static export

## 7. Test the Connection

Access your application and verify that it can connect to the database.
