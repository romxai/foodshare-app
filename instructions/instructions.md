# Project Requirement Document (PRD) for Food Sharing Web App

## 1. Project Overview

### 1.1 Introduction

This project is a web-based application aimed at facilitating the sharing of surplus food within local communities. Users can list food items they have available for sharing or request food from others. The app will connect individuals and organizations who want to reduce food waste by sharing food with those in need.

### 1.2 Objectives

- **User Engagement:** Provide an interactive platform where users can share and request food items easily.
- **Localization:** Allow users to connect with people in their vicinity to either donate or request food.
- **Usability:** Ensure a clean and intuitive user interface, designed for ease of navigation and community-building.
- **Authentication & Security:** Implement user authentication for posting and requesting food. Secure all user data with JWT authentication.
- **Data Handling:** Manage food item listings, user profiles, and messages securely using MongoDB.
- **Geolocation:** Allow users to see food items available near their location using Google Maps integration.

### 1.3 Target Audience

Sellers (individuals or organizers with leftover food) and Buyers (NGOs, shelters, or people who distribute food).

### 1.4 Platform Functionality

- **Sellers:** Post food details, location, and contact information.
- **Buyers:** View listings, contact sellers via email, phone, or WhatsApp.

### 1.5 Design Goals

- The design should be clean, modern, and mobile-responsive.
- Use Next.js App Router with best practices for folder structure.
- Placeholder logo and name to be used until the actual assets are ready.

## 2. Tech Stack

### 2.1 Frontend

- **Next.js:** React framework for server-side rendering and static site generation.
- **Shadcn/UI:** Pre-installed components for modern, accessible UI.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **Lucide Icons:** Consistent and visually appealing icons for UI elements.
- **Google Maps API:** For mapping food locations and enabling geolocation-based searches.

### 2.2 Backend

- **Node.js:** JavaScript runtime environment for server-side logic.
- **Express.js:** Web framework for building RESTful APIs and handling routes.
- **MongoDB:** NoSQL database for storing user profiles, food listings, and conversations.
- **JWT (JSON Web Tokens):** For handling secure token-based authentication.
- **Google Maps API:** For location data.
- **Multer:** Middleware for handling file uploads (images of food items).
- **CORS Middleware:** Secure cross-origin API communication.

### 2.3 Authentication

- **JWT (JSON Web Tokens)**: For secure, role-based authentication.

### 2.4 Deployment & Miscellaneous

- Vercel for hosting (Next.js is optimized for Vercel).
- Placeholder services for SMS/WhatsApp (like Twilio).
- **Version Control:** Git (using best cursor workflows).

## 3. Core Functionalities

### Phase 1: User Management & Authentication

#### 3.1 User Authentication

- **Signup & Login Pages:**
  - Allow users to sign up with email, password and location.
  - Allow users to log in with email and password.
  - Authenticate users using JWT tokens.
  - Both buyers and sellers use the same login.
  - Roles are dynamic, depending on what the user wants to post or view.

#### 3.2 Profile Management

- **Profile Management:**
  - Update user information such as email, phone, and password.
  - Adjust notification settings.
- **My Account:** View all user activity (posts made, contact history).

#### 3.3 Loading States

- **Loading State:** Implement loading states/pages for all API calls.

### Phase 2: Food Listings

#### 3.2 Create Food Listing

- **Post a New Listing:**
  - Sellers can create a post that includes:
    - **Food Details:** Type of food, quantity, special instructions (if applicable, like allergies).
    - **Source:** Party, event, or any specific location details.
    - **Expiration Date** (when food will no longer be available).
    - **Contact Information:** Email, phone, WhatsApp link (click-to-call/message feature).
    - **Location Details:** City/area.
  - **Manage Postings:** Sellers can view and edit their active postings.
- **Location Information:** Automatically geotag the food listing based on the user's location.

#### 3.3 Browse & Search Listings

- **Home Page / Feed:**
  - Buyers and sellers can view a list of all active food postings.
  - Search and filter by location, type of food, etc.
  - Display food details, source, expiration, and contact info.
- **Search Listings:**
  - Users can search food listings by keyword or filter by distance from their location.
- **Map Integration:**
  - Display food listings on Google Maps to allow users to see available food near them.

### Phase 3: Messaging System

#### 3.4 Message System

- **In-App Messaging:** Allow users to send and receive messages about food listings, facilitating communication for pickup.

### Phase 4: Notifications & History

#### 3.5 Notifications

- **Email Notifications:** Notify users via email when someone sends them a message or requests their food item.

#### 3.6 Transaction History

- **Food History:** Users can see a history of food items they've shared or received in the past.

### Phase 4: Mobile Responsiveness and UX Enhancements (Medium Priority)

- Ensure the app is fully mobile-responsive.
- Implement UI/UX best practices (using Shadcn/ui and Magic UI) for seamless user interaction.

## 4. API Endpoints

### 4.1 User Authentication and Management

| Method | Endpoint            | Description                            | Parameters/Body                          |
| ------ | ------------------- | -------------------------------------- | ---------------------------------------- |
| POST   | `/api/auth/signup`  | Create a new user account              | `name`, `email`, `password`, `location`  |
| POST   | `/api/auth/login`   | Authenticate user and return JWT token | `email`, `password`                      |
| GET    | `/api/user/profile` | Get user profile (protected)           | JWT token                                |
| PUT    | `/api/user/profile` | Update user profile (protected)        | `name`, `location`, `contact`, JWT token |

### 4.2 Food Listings

| Method | Endpoint                | Description                                           | Parameters/Body                                           |
| ------ | ----------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| POST   | `/api/food/listing`     | Create a new food listing (protected)                 | `description`, `quantity`, `image`, `location`, JWT token |
| GET    | `/api/food/listing`     | Fetch all available food listings                     | `query params`: search term, location                     |
| GET    | `/api/food/listing/:id` | Get details of a specific food listing                | `id` of the listing                                       |
| DELETE | `/api/food/listing/:id` | Delete a food listing (protected, user who posted it) | `id`, JWT token                                           |

### 4.3 Messaging System

| Method | Endpoint             | Description                                         | Parameters/Body                   |
| ------ | -------------------- | --------------------------------------------------- | --------------------------------- |
| POST   | `/api/messages/send` | Send a message to another user about a food listing | `listingId`, `message`, JWT token |
| GET    | `/api/messages/:id`  | Fetch conversation for a food listing               | `id` of the listing, JWT token    |

### 4.4 Notifications

| Method | Endpoint             | Description                                    | Parameters/Body |
| ------ | -------------------- | ---------------------------------------------- | --------------- |
| GET    | `/api/notifications` | Fetch all notifications for the logged-in user | JWT token       |

## 5. Proposed File Structure

### 5.1 Frontend

```
foodshare/
├── app/
│   ├── components/
│   │   ├── FoodListingCard.tsx
│   │   ├── MessageBox.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── InputField.tsx
│   │   ├── MapView.tsx
│   │   └── AuthForms/
│   │       ├── LoginForm.tsx
│   │       └── SignupForm.tsx
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── profile.tsx
│   │   ├── food/
│   │   │   ├── [id].tsx
│   │   │   └── create.tsx
│   │   ├── messages.tsx
│   ├── styles/
│   └── layout.tsx
├── lib/
│   └── api.js (API calls to backend)
├── public/
│   ├── images/
│   │   └── food_default.png
└── .env
```

### 5.2 Backend

```
server/
├── index.js
├── routes/
│   ├── api.js
│   └── auth.js (Login and Signup routes)
├── models/
│   ├── User.js
│   ├── FoodListing.js
│   └── Message.js
├── services/
│   └── googleMapsService.js (Geolocation, distance calculations)
├── middlewares/
│   ├── auth.js (JWT authentication middleware)
├── config/
│   └── db.js (MongoDB connection)
├── uploads/
│   └── food_images/ (Uploaded food item images)
├── package.json
└── .env (API keys, MongoDB URIs, JWT secret)
```

## 6. Security, Compliance, and Deployment

### 6.1 Security

- **JWT Security:** Implement secure JWT token handling for all authenticated routes.
- **Input Validation:** Validate and sanitize all user inputs to prevent XSS and injection attacks.
- **File Uploads:** Use Multer for securely uploading and storing food item images.

### 6.2 CORS Configuration

- **CORS Setup:** Configure CORS to handle secure cross-origin requests, restricting access to the frontend domain.

### 6.3 Deployment

- **Frontend Deployment:** Deploy the Next.js application using Vercel.
- **Backend Deployment:** Deploy the Express.js server on platforms like Heroku, AWS, or DigitalOcean.
- **Environment Variables:** Use `.env` files for storing sensitive data like API keys, JWT secrets, and MongoDB connection strings.

## 7. ProposedDatabase Schema (MongoDB)

#### Users Collection

- `username`: String
- `email`: String (unique)
- `password`: String (hashed)
- `location`: String
- `contact`: Object (phone, WhatsApp, email)

#### Postings Collection

- `foodType`: String
- `description`: String
- `image`: String (URL to image)
- `quantity`: String
- `source`: String (party, event, etc.)
- `expiration`: Date
- `contactInfo`: Object (email, phone, WhatsApp)
- `postedBy`: User ID
- `location`: String

## 8. Code Examples

### JWT Authentication Setup

```javascript
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
```

### Next.js API Route (Create Post Example)

```javascript
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { foodType, quantity, source, expiration, contactInfo, location } =
        req.body;
      // Add data validation and MongoDB insertion logic here

      return res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
```
