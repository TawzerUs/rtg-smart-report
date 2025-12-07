# Quick Access to App

## Temporary Bypass (While Login is Being Fixed)

Since the login is experiencing issues, you can access the app directly using these temporary pages:

### Option 1: Admin Setup Page
**URL:** `https://yooryka.web.app/admin-setup`

This page allows you to:
- Create admin users
- Access is public (no login required)

### Option 2: Seed Data Page  
**URL:** `https://yooryka.web.app/seed-data`

This page allows you to:
- View and seed database data
- Access is public (no login required)

## Current Login Credentials (When Fixed)

- **Email:** `admin@rtg.com`
- **Password:** `admin2025`
- **Role:** Admin

## Database Data

The Supabase database currently has:
- **7 RTGs:** RTG12, RTG13, RTG15, RTG16, RTG18, RTG19, RTG21
- **6 Zones:** Z01-Z06
- **28 Work Orders:** Various tasks for each RTG

## Issue Summary

The authentication works (verified by direct Supabase test), but the app's login flow has a redirect issue that prevents access to the dashboard after successful authentication.
