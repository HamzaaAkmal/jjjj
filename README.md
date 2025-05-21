# ApartmentPro - Property Management System

ApartmentPro is a comprehensive property management system designed for real estate companies to manage apartments, clients, payments, and more. This application provides a complete solution for property management with separate admin and client dashboards.

![ApartmentPro Dashboard](https://placeholder.svg?height=300&width=600)

## Features

- **Admin Dashboard**: Comprehensive overview of properties, clients, and finances
- **Client Management**: Track and manage client information and interactions
- **Apartment Management**: Manage property listings, availability, and details
- **Payment Tracking**: Monitor installment plans and payment schedules
- **CRM System**: Lead management and follow-up tasks
- **Financial Management**: Track construction and finance accounts
- **Multi-currency Support**: Support for USD and PKR currencies
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Firebase integration for instant data synchronization
- **Authentication**: Secure login for admins and clients

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Hosting**: cPanel

## Prerequisites

Before deploying this application, ensure you have:

1. A cPanel hosting account with Node.js support
2. A Firebase account
3. Basic knowledge of cPanel and Firebase
4. Access to your domain's DNS settings

## Setup Instructions

### 1. Firebase Setup

#### Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics if desired

#### Set Up Authentication

1. In the Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable Email/Password authentication
4. Optionally, enable other authentication methods as needed

#### Set Up Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Start in production mode
4. Choose a location closest to your users
5. Create the following collections:
   - `users`
   - `clients`
   - `apartments`
   - `buildings`
   - `payments`
   - `transactions`
   - `leads`
   - `tasks`
   - `adBanners`
   - `settings`

#### Set Up Storage

1. Go to "Storage"
2. Click "Get started"
3. Follow the setup wizard
4. Set up appropriate security rules

#### Get Firebase Configuration

1. Go to Project Settings
2. Scroll down to "Your apps" section
3. Click the web app icon (</>) to create a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object for later use

### 2. cPanel Setup

#### Create a Node.js Application

1. Log in to your cPanel account
2. Navigate to the "Setup Node.js App" section
3. Create a new Node.js application:
   - Set the application path to your desired directory
   - Set Node.js version to 18.x or higher
   - Set the application URL to your domain or subdomain
   - Set the application startup file to `node_modules/.bin/next start`
   - Set application mode to Production

#### Set Up Environment Variables

In cPanel, add the following environment variables to your Node.js application:

\`\`\`
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
JWT_SECRET=your_jwt_secret
\`\`\`

Replace the placeholder values with your actual Firebase configuration.

### 3. Application Deployment

#### Option 1: Deploy via Git

1. Create a Git repository for your project
2. Push your code to the repository
3. In cPanel, use the Git Version Control feature to clone your repository
4. Set up deployment hooks if desired

#### Option 2: Manual Upload

1. Build your application locally:
   \`\`\`bash
   npm run build
   \`\`\`
2. Upload the following files and directories to your cPanel hosting:
   - `.next/` directory
   - `public/` directory
   - `package.json`
   - `package-lock.json`
   - `next.config.js`
   - Any other necessary files

3. Install dependencies on the server:
   \`\`\`bash
   npm install --production
   \`\`\`

4. Start your application:
   \`\`\`bash
   npm start
   \`\`\`

### 4. Database Configuration

#### Initialize Firebase in Your Application

Ensure your Firebase configuration is correctly set up in `lib/firebase.ts`:

\`\`\`typescript
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { app, db, auth, storage }
\`\`\`

#### Set Up Firestore Security Rules

In the Firebase Console, go to Firestore Database > Rules and set up appropriate security rules:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin access rules
    match /{document=**} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Client access rules
    match /clients/{clientId} {
      allow read: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        request.auth.uid == resource.data.userId
      );
    }
    
    // Public access rules
    match /buildings/{buildingId} {
      allow read: if true;
    }
    
    match /apartments/{apartmentId} {
      allow read: if true;
    }
  }
}
\`\`\`

### 5. Domain Configuration

#### Set Up Domain or Subdomain

1. In cPanel, go to "Domains" or "Subdomains"
2. Create a new subdomain or use your main domain
3. Point the domain to your Node.js application directory

#### Configure SSL

1. In cPanel, go to "SSL/TLS"
2. Use "Let's Encrypt" or another SSL provider to secure your domain
3. Follow the wizard to install the SSL certificate

### 6. Testing Your Deployment

1. Visit your domain in a web browser
2. Test the login functionality
3. Verify that data is being saved to and retrieved from Firebase
4. Test all major features of the application

## Initial Setup

### Create Admin User

1. Register a new user through the application
2. In Firebase Console, go to Firestore Database
3. Find the user in the `users` collection
4. Edit the document and set `role` to `admin`

### Add Initial Data

1. Log in as an admin
2. Add buildings, apartments, and other initial data
3. Configure system settings

## Troubleshooting

### Common Issues

#### Application Not Starting

- Check Node.js version compatibility
- Verify that all dependencies are installed
- Check for errors in the application logs

#### Firebase Connection Issues

- Verify that Firebase configuration is correct
- Check if Firebase services are enabled
- Ensure that security rules are properly configured

#### Database Operations Failing

- Check Firebase console for any quota limitations
- Verify that your security rules allow the operations
- Check for any validation errors in your data

#### Authentication Problems

- Ensure Firebase Authentication is properly set up
- Check for CORS issues if using custom domains
- Verify that the JWT secret is properly configured

## Maintenance

### Regular Updates

1. Keep your Node.js version up to date
2. Regularly update npm packages
3. Monitor Firebase usage and quotas

### Backups

1. Regularly export Firestore data
2. Back up your application code
3. Document any custom configurations

### Monitoring

1. Set up Firebase Monitoring
2. Configure alerts for critical issues
3. Regularly check application logs

## Support

If you encounter any issues or need assistance, please contact our support team at support@apartmentpro.com.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
