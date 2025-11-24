# Deployment Guide: RTG Smart Report

This guide explains how to deploy your application to **Firebase Hosting** and connect a **Custom Domain**.

## Prerequisites
1.  **Google Account** (for Firebase).
2.  **Domain Name** (purchased from GoDaddy, Namecheap, etc.).
3.  **Node.js** installed (you already have this).

---

## Step 1: Install Firebase Tools
Open your terminal and run:
```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase
```bash
firebase login
```
This will open your browser to log in with your Google account.

## Step 3: Initialize Project
Run this command in your project folder:
```bash
firebase init hosting
```
- **Select:** `Use an existing project` (if you have one) or `Create a new project`.
- **Public directory:** Type `dist` (this is important!).
- **Configure as a single-page app?** Type `Yes` (y).
- **Set up automatic builds and deploys with GitHub?** Type `No` (n) for now.
- **Overwrite index.html?** Type `No` (n).

## Step 4: Build the App
Create the production version of your app:
```bash
npm run build
```
This creates a `dist` folder with your optimized files.

## Step 5: Deploy!
```bash
firebase deploy
```
Firebase will give you a URL like `https://your-project-id.web.app`.

---

## Step 6: Connect Custom Domain (e.g., www.rtg-report.com)

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Click **Hosting** in the left sidebar.
4.  Click **Add Custom Domain**.
5.  Enter your domain name (e.g., `rtg-report.com`).
6.  **Verify Ownership:** Firebase will give you a `TXT` record.
    - Go to your Domain Provider (GoDaddy, etc.).
    - Add a new DNS record: Type `TXT`, Host `@`, Value `[Firebase Value]`.
7.  **Go Live:** Once verified, Firebase will give you `A` records.
    - Add these `A` records to your DNS settings.

**That's it!** Firebase will automatically provision a **Free SSL Certificate** (HTTPS) for your domain within an hour.
