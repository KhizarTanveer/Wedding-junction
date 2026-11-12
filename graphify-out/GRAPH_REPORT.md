# Graph Report - wedding-junction  (2026-11-12)

## Corpus Check
- 174 files · ~113,219 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 2, (none) 1, .css 1)

## Summary
- 1296 nodes · 2123 edges · 84 communities (63 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5a9c5fc9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- backend/package.json
- ChatPage
- publicRoutes.jsx
- frontend/package.json
- Wedding Junction - Project Overview
- vendorDashboardRoutes.js
- BookingsPage
- toast.js
- Wedding Junction
- StaticPage
- AdminPage
- react
- authController.js
- test-data.ts
- react-router-dom
- VendorDashboardPage
- AuthContext.jsx
- adminRoutes.js
- PaymentPage
- mongoose
- auth.fixture.ts
- ResetPasswordPage
- SignupPage
- bookingRoutes.js
- api.fixture.ts
- LoginPage
- ProfilePage
- VendorPage
- scripts
- app.js
- seedTestData.js
- src/constants/statuses.js
- Bookings.jsx
- backend/constants/index.js
- authorize.js
- HomePage
- server.js
- chatRoutes.js
- reviewRoutes.js
- account-management.spec.ts
- pages/index.ts
- rateLimiter.js
- VendorApplicationService
- security.js
- PaymentSuccessPage
- booking.js
- ReviewList.jsx
- BookingStateMachine
- Payment.jsx
- vendorRoutes.jsx
- Vendor.js
- API Endpoints Reference
- Detailed Setup Steps
- vendorRoutes.js
- 12. Troubleshooting
- logger.js
- Wedding Junction - Client Setup Guide
- manifest.json
- legalRoutes.jsx
- Wedding Junction - Setup Guide
- sendEmail.js
- express
- Email Service (Optional)
- Troubleshooting Common Issues
- categoryRoutes.js
- vendorApplication.js
- 11. API Endpoints Quick Reference
- 2. Prerequisites
- 4. Detailed Installation Steps
- Prerequisites
- 5. Environment Configuration
- 8. Running the Application
- 9. Default Login Credentials
- Running the Application
- Building for Production
- authMiddleware.js
- 10. Available Scripts Reference
- 7. Database Setup
- Step 5: Configure Environment Variables
- CLAUDE.md
- setup.sh

## God Nodes (most connected - your core abstractions)
1. `ChatPage` - 58 edges
2. `BookingsPage` - 42 edges
3. `react-router-dom` - 39 edges
4. `react` - 38 edges
5. `StaticPage` - 29 edges
6. `AdminPage` - 28 edges
7. `API_URL` - 27 edges
8. `VendorDashboardPage` - 25 edges
9. `VendorPage` - 25 edges
10. `@playwright/test` - 24 edges

## Surprising Connections (you probably didn't know these)
- `forgotPassword()` --calls--> `sendPasswordResetEmail()`  [EXTRACTED]
  backend/controllers/authController.js → backend/utils/sendEmail.js
- `confirmBooking()` --calls--> `sendBookingConfirmationEmail()`  [EXTRACTED]
  backend/controllers/bookingController.js → backend/utils/sendEmail.js
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/pages/Login.jsx → frontend/src/context/AuthContext.jsx
- `ManageVendors()` --calls--> `showError()`  [EXTRACTED]
  frontend/src/pages/admin/ManageVendors.jsx → frontend/src/utils/toast.js
- `App()` --calls--> `AppRoutes()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/routes/index.jsx

## Import Cycles
- None detected.

## Communities (84 total, 21 thin omitted)

### Community 0 - "backend/package.json"
Cohesion: 0.05
Nodes (51): author, dependencies, bcryptjs@^3.0.3, cloudinary@^2.8.0, cors@^2.8.5, dotenv@^17.2.3, express-mongo-sanitize@^2.2.0, express-rate-limit@^7.5.0 (+43 more)

### Community 2 - "publicRoutes.jsx"
Cohesion: 0.07
Nodes (22): Section(), Categories(), CategoryCard, FeaturedVendors(), StarRating, VendorCard, Hero(), Footer() (+14 more)

### Community 3 - "frontend/package.json"
Cohesion: 0.05
Nodes (48): browserslist, development, production, dependencies, react@^19.2.0, react-dom@^19.2.0, react-router-dom@^7.9.5, react-scripts@5.0.1 (+40 more)

### Community 4 - "Wedding Junction - Project Overview"
Cohesion: 0.05
Nodes (37): 1. Vendor Discovery & Browsing, 2. Booking System, 3. Real-Time Chat, 4. User Roles, 5. Reviews & Ratings, 6. Payment Processing, Admin Journey, Admin Pages (Administrators Only) (+29 more)

### Community 5 - "vendorDashboardRoutes.js"
Cohesion: 0.09
Nodes (28): deleteFromCloudinary(), uploadMultipleToCloudinary(), uploadToCloudinary(), acceptBooking(), completeBooking(), deleteGalleryImage(), getVendorBookings(), getVendorConversations() (+20 more)

### Community 7 - "toast.js"
Cohesion: 0.11
Nodes (13): App(), ErrorBoundary, Navbar(), ScrollToTop(), ChatContext, ChatProvider(), useChat(), root (+5 more)

### Community 8 - "Wedding Junction"
Cohesion: 0.07
Nodes (28): 1. Clone the Repository, 2. Run Setup Script, 3. Environment Setup, 4. Start MongoDB, 5. Seed the Database, 6. Run the Application, 7. Access the Application, API Endpoints (+20 more)

### Community 11 - "react"
Cohesion: 0.18
Nodes (9): API_URL, Dashboard(), ManageCategories(), ManageReviews(), ManageServices(), Input(), ManageVendors(), adminRoutes (+1 more)

### Community 12 - "authController.js"
Cohesion: 0.15
Nodes (21): applyAsVendor(), bcrypt, changePassword(), crypto, deleteAccount(), forgotPassword(), generateToken(), getApplicationStatus() (+13 more)

### Community 13 - "test-data.ts"
Cohesion: 0.14
Nodes (12): isLoggedIn(), logout(), BOOKING_STATUSES, BookingStatus, generateUniqueEmail(), generateUniquePhone(), invalidPayment, testAdmin (+4 more)

### Community 14 - "react-router-dom"
Cohesion: 0.17
Nodes (13): BecomeVendor(), ForgotPassword(), Login(), NotFound(), PaymentSuccess(), ResetPassword(), Signup(), authRoutes (+5 more)

### Community 16 - "AuthContext.jsx"
Cohesion: 0.19
Nodes (16): AdminRoute(), PrivateRoute(), VendorRoute(), AuthContext, AuthProvider(), useAuth(), useRequireAuth(), clearAuthData() (+8 more)

### Community 17 - "adminRoutes.js"
Cohesion: 0.18
Nodes (18): CATEGORY_ALLOWED_FIELDS, createCategory(), createService(), createVendor(), deleteCategory(), deleteService(), deleteVendor(), filterObject() (+10 more)

### Community 19 - "mongoose"
Cohesion: 0.12
Nodes (14): categorySchema, mongoose, mongoose, serviceSchema, mongoose, userSchema, mongoose@^9.1.1, bcrypt (+6 more)

### Community 20 - "auth.fixture.ts"
Cohesion: 0.14
Nodes (9): AuthFixtures, authTokens, createTestBooking(), getAuthToken(), login(), loginAsAdmin(), loginAsVendor(), setBookingStatus() (+1 more)

### Community 23 - "bookingRoutes.js"
Cohesion: 0.15
Nodes (14): confirmBooking(), createBooking(), deleteBooking(), getBookingById(), getBookings(), mongoose, Joi, schemas (+6 more)

### Community 24 - "api.fixture.ts"
Cohesion: 0.17
Nodes (15): apiLogin(), apiRequest(), ApiResponse, cleanupTestData(), createBookingWithStatus(), createCompletedBooking(), deleteBooking(), deleteConversation() (+7 more)

### Community 28 - "scripts"
Cohesion: 0.12
Nodes (17): description, devDependencies, concurrently@^8.2.2, name, private, scripts, dev, dev:backend (+9 more)

### Community 29 - "app.js"
Cohesion: 0.15
Nodes (14): apiLimiter, authLimiter, cors, corsOptions, express, helmet, isTestOrDev(), path (+6 more)

### Community 30 - "seedTestData.js"
Cohesion: 0.12
Nodes (12): conversationSchema, mongoose, messageSchema, mongoose, bcrypt, mongoose, testCategories, testUsers (+4 more)

### Community 31 - "src/constants/statuses.js"
Cohesion: 0.12
Nodes (12): API_ENDPOINTS, ROLE_LABELS, TIER_LABELS, USER_ROLES, VENDOR_TIERS, generateRoute, ROUTES, BOOKING_STATUS_BADGES (+4 more)

### Community 32 - "Bookings.jsx"
Cohesion: 0.21
Nodes (13): Bookings(), FormGrid(), Input(), Modal(), Popup(), PrimaryBtn(), SecondaryBtn(), ExploreVendorDetails() (+5 more)

### Community 33 - "backend/constants/index.js"
Cohesion: 0.23
Nodes (12): ERROR_MESSAGES, SUCCESS_MESSAGES, ACCOUNT_STATUSES, PERMISSION_SCOPES, USER_ROLES, VENDOR_TIERS, BOOKING_STATUS_LIST, BOOKING_STATUSES (+4 more)

### Community 34 - "authorize.js"
Cohesion: 0.13
Nodes (13): authorize(), checkPermission(), ownsBooking(), ownsReview(), ownsVendor(), requireActiveVendor(), requireAdmin, requireVendor (+5 more)

### Community 36 - "server.js"
Cohesion: 0.15
Nodes (11): app, connectDB(), mongoose, http, io, missingEnvVars, mongoose, requiredEnvVars (+3 more)

### Community 37 - "chatRoutes.js"
Cohesion: 0.25
Nodes (13): closeConversation(), createBookingFromChat(), deleteConversation(), deleteMessage(), getConversation(), getConversations(), markAsRead(), sendMessage() (+5 more)

### Community 38 - "reviewRoutes.js"
Cohesion: 0.24
Nodes (13): addResponse(), createReview(), deleteReview(), getMyReviews(), getPendingReviews(), getReview(), getVendorReviews(), markHelpful() (+5 more)

### Community 39 - "account-management.spec.ts"
Cohesion: 0.30
Nodes (7): getRemainingAttempts(), loginAsUser(), loginWithFailedAttempts(), resetTestUsers(), test, passwordChange, profileUpdate

### Community 40 - "pages/index.ts"
Cohesion: 0.23
Nodes (3): testChatMessage, testReview, @playwright/test

### Community 41 - "rateLimiter.js"
Cohesion: 0.16
Nodes (12): apiLimiter, applicationLimiter, authLimiter, bookingLimiter, createRateLimiter(), isInTestMode(), messageLimiter, passwordResetLimiter (+4 more)

### Community 43 - "security.js"
Cohesion: 0.26
Nodes (10): applySecurity(), detectSuspiciousActivity(), preventHPP(), sanitizeBody(), sanitizeObject(), sanitizeString(), sanitizeStringsInObject(), securityHeaders() (+2 more)

### Community 45 - "booking.js"
Cohesion: 0.20
Nodes (10): BOOKING_STATUSES, bookingSchema, clientDetailsSchema, documentSchema, mongoose, noteSchema, reminderSchema, statusHistorySchema (+2 more)

### Community 46 - "ReviewList.jsx"
Cohesion: 0.26
Nodes (8): RATING_CATEGORIES, ReviewForm(), StarRating(), RatingSummary(), ReviewCard(), ReviewList(), StarDisplay(), VendorDetail()

### Community 48 - "Payment.jsx"
Cohesion: 0.40
Nodes (9): Input(), Payment(), detectCardType(), formatCardNumber(), formatExpiry(), validateCardNumber(), validateCVV(), validateExpiry() (+1 more)

### Community 49 - "vendorRoutes.jsx"
Cohesion: 0.22
Nodes (8): FILTER_GROUPS, STATUS_CONFIG, VendorBookings(), BOOKING_STATUS_COLORS, STATUS_CONFIG, VendorDashboard(), VendorProfile(), vendorRoutes

### Community 50 - "Vendor.js"
Cohesion: 0.20
Nodes (9): auditLogSchema, badgeSchema, credentialSchema, galleryImageSchema, mongoose, serviceAreaSchema, serviceOfferingSchema, statusHistorySchema (+1 more)

### Community 51 - "API Endpoints Reference"
Cohesion: 0.20
Nodes (10): Admin (`/api/admin`), API Endpoints Reference, Authentication (`/api/auth`), Bookings (`/api/bookings`), Categories (`/api/categories`), Chat (`/api/chat`), Reviews (`/api/reviews`), Services (`/api/services`) (+2 more)

### Community 52 - "Detailed Setup Steps"
Cohesion: 0.20
Nodes (10): Detailed Setup Steps, Step 1: Download/Clone the Project, Step 2: Navigate to the Project Folder, Step 3: Install Frontend Dependencies, Step 4: Install Backend Dependencies, Step 6: Start MongoDB, Step 7: Seed the Database, Step 8: Start the Servers (+2 more)

### Community 53 - "vendorRoutes.js"
Cohesion: 0.36
Nodes (7): escapeRegex(), getFeaturedVendors(), getVendorById(), getVendors(), getVendorsByCategory(), express, router

### Community 54 - "12. Troubleshooting"
Cohesion: 0.22
Nodes (9): 12. Troubleshooting, CORS Errors in Browser, Images Not Uploading, Login/Authentication Issues, Missing Environment Variables, Module Not Found Errors, MongoDB Connection Issues, Port Already in Use (+1 more)

### Community 55 - "logger.js"
Cohesion: 0.25
Nodes (6): colors, format, levels, logger, transports, winston

### Community 56 - "Wedding Junction - Client Setup Guide"
Cohesion: 0.25
Nodes (7): 1. Project Overview, 3. Quick Start (TL;DR), Key Features, Need More Help?, Table of Contents, Tech Stack, Wedding Junction - Client Setup Guide

### Community 57 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 58 - "legalRoutes.jsx"
Cohesion: 0.36
Nodes (4): Cookies(), Privacy(), Terms(), legalRoutes

### Community 59 - "Wedding Junction - Setup Guide"
Cohesion: 0.25
Nodes (8): Backend Variables (`backend/.env`), Environment Variables Reference, Frontend Variables (`.env` in root), Need Help?, Project Structure Reference, Quick Start (TL;DR), Table of Contents, Wedding Junction - Setup Guide

### Community 60 - "sendEmail.js"
Cohesion: 0.43
Nodes (6): approveVendorApplication(), nodemailer, sendBookingConfirmationEmail(), sendEmail(), sendPasswordResetEmail(), sendVendorApprovalEmail()

### Community 61 - "express"
Cohesion: 0.33
Nodes (5): getServices(), express@^5.2.1, express, router, express

### Community 62 - "Email Service (Optional)"
Cohesion: 0.29
Nodes (7): 6. Third-Party Services Setup, Cloudinary (Image Storage) - Required, Email Service (Optional), Option 1: Gmail SMTP, Option 2: Mailtrap (Recommended for Testing), Option 3: SendGrid, Step-by-Step Setup:

### Community 63 - "Troubleshooting Common Issues"
Cohesion: 0.29
Nodes (7): Environment Variable Errors, Frontend Not Loading, "Module not found" Errors, MongoDB Connection Issues, Port Already in Use, Seed Command Fails, Troubleshooting Common Issues

### Community 64 - "categoryRoutes.js"
Cohesion: 0.47
Nodes (4): getCategories(), getCategoryByName(), express, router

### Community 65 - "vendorApplication.js"
Cohesion: 0.33
Nodes (5): documentSchema, mongoose, portfolioItemSchema, statusHistorySchema, vendorApplicationSchema

### Community 66 - "11. API Endpoints Quick Reference"
Cohesion: 0.33
Nodes (6): 11. API Endpoints Quick Reference, Authentication (`/api/auth`), Bookings (`/api`) - Protected, Categories & Services (`/api`), Chat (`/api/chat`) - Protected, Vendors (`/api`)

### Community 67 - "2. Prerequisites"
Cohesion: 0.40
Nodes (5): 2. Prerequisites, Recommended, Required Accounts, Required Software, Verify Installation

### Community 68 - "4. Detailed Installation Steps"
Cohesion: 0.40
Nodes (5): 4. Detailed Installation Steps, Step 1: Extract Project Files, Step 2: Install Frontend Dependencies, Step 3: Install Backend Dependencies, Step 4: Configure Environment Variables

### Community 69 - "Prerequisites"
Cohesion: 0.40
Nodes (5): 1. Node.js (Required), 2. MongoDB (Required), 3. Code Editor (Optional but Recommended), 4. Cloudinary Account (Required for image uploads), Prerequisites

### Community 70 - "5. Environment Configuration"
Cohesion: 0.50
Nodes (4): 5. Environment Configuration, Backend Environment File, Frontend Environment File, Generating a Secure JWT Secret

### Community 71 - "8. Running the Application"
Cohesion: 0.50
Nodes (4): 8. Running the Application, Access the Application, Terminal 1: Start the Backend, Terminal 2: Start the Frontend

### Community 72 - "9. Default Login Credentials"
Cohesion: 0.50
Nodes (4): 9. Default Login Credentials, Admin Account, Creating Test User Accounts, Sample Vendor Accounts

### Community 73 - "Running the Application"
Cohesion: 0.50
Nodes (4): Access URLs, Default Login Credentials, Development Mode, Running the Application

### Community 74 - "Building for Production"
Cohesion: 0.50
Nodes (4): Build the Frontend, Building for Production, Production Backend, Production Considerations

### Community 76 - "10. Available Scripts Reference"
Cohesion: 0.67
Nodes (3): 10. Available Scripts Reference, Backend Scripts (run from `backend` folder), Frontend Scripts (run from project root)

### Community 77 - "7. Database Setup"
Cohesion: 0.67
Nodes (3): 7. Database Setup, Running the Seed Script, Starting MongoDB on Windows

### Community 78 - "Step 5: Configure Environment Variables"
Cohesion: 0.67
Nodes (3): 5a. Backend Environment File, 5b. Frontend Environment File, Step 5: Configure Environment Variables

## Knowledge Gaps
- **2 isolated node(s):** `react-app`, `react-app/jest`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 652 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@playwright/test` connect `pages/index.ts` to `frontend/package.json`, `auth.fixture.ts`, `test-data.ts`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **What connects `react-app`, `react-app/jest` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05203619909502263 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Bookings.jsx`, `publicRoutes.jsx`, `frontend/package.json`, `toast.js`, `ReviewList.jsx`, `react-router-dom`, `AuthContext.jsx`, `Payment.jsx`, `vendorRoutes.jsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `ChatPage` be split into smaller, more focused modules?**
  _Cohesion score 0.0392156862745098 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `react-router-dom` to `Bookings.jsx`, `publicRoutes.jsx`, `frontend/package.json`, `toast.js`, `react`, `AuthContext.jsx`, `Payment.jsx`, `vendorRoutes.jsx`, `legalRoutes.jsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `publicRoutes.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06775510204081632 - nodes in this community are weakly interconnected._