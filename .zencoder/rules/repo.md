---
description: Repository Information Overview
alwaysApply: true
---

# Cab Booking Application Information

## Summary
A mobile application for cab booking services built with React Native and Expo, using Supabase for backend services. The app supports both riders and drivers with features like ride booking, payments, and real-time tracking.

## Structure
- **app/**: Expo Router application routes
- **assets/**: Static assets like images and fonts
- **components/**: Reusable UI components
- **constants/**: Application constants and configuration
- **contexts/**: React context providers
- **hooks/**: Custom React hooks
- **lib/**: Library initializations and utilities
- **services/**: API and backend service integrations
- **types/**: TypeScript type definitions
- **.zencoder/**: Zencoder configuration

## Language & Runtime
**Language**: TypeScript/JavaScript
**Framework**: React Native with Expo
**Package Manager**: npm/yarn
**Backend**: Supabase (PostgreSQL, Auth, Storage)

## Dependencies
**Main Dependencies**:
- expo: Application framework
- react-native: Mobile UI framework
- @supabase/supabase-js: Supabase client
- expo-router: File-based routing
- zustand: State management
- react-native-maps: Map integration
- @react-native-async-storage/async-storage: Local storage

**Development Dependencies**:
- typescript: Type checking
- jest: Testing framework
- eslint: Code linting
- prettier: Code formatting

## Services
The application uses several services for different functionalities:

### Authentication Service
- User registration and login
- Phone verification
- Profile management
- Session handling

### User Service
- User profile management
- Customer and driver profile handling
- Document uploads
- Loyalty points management

### Booking Service
- Ride creation and management
- Fare calculation
- Driver assignment
- Ride status updates

### Location Service
- Location search
- Saved locations management
- Distance and travel time calculation

### Payment Service
- Payment processing
- Fare breakdown
- Refunds
- Transaction history

### Driver Service
- Driver profile management
- Vehicle management
- Earnings tracking
- Availability updates

### Notification Service
- In-app notifications
- Push notifications
- Notification management

## State Management
The application uses Zustand for state management with several stores:

- **AuthStore**: Authentication state
- **RideStore**: Ride booking and management
- **LocationStore**: Location management
- **NotificationStore**: Notification handling
- **DriverStore**: Driver-specific functionality
- **ThemeStore**: Theme preferences

## Features
- User authentication (email, phone, social)
- Ride booking with different service types
- Real-time driver tracking
- Multiple payment methods
- Ride history and receipts
- Driver earnings and statistics
- Ratings and reviews
- Dark/light theme support
- Push notifications

## Database Schema
The application uses Supabase with tables for:
- users
- customers
- drivers
- bookings
- payments
- locations
- ratings
- notifications
- driver_vehicles
- driver_earnings

## Mobile-Specific Features
- Location services
- Push notifications
- Camera access for document uploads
- Background location tracking for drivers
- Deep linking for authentication flows