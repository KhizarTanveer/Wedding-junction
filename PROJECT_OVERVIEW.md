# Wedding Junction - Project Overview

A comprehensive guide to understanding the Wedding Junction platform.

---

## Table of Contents

1. [What is Wedding Junction?](#what-is-wedding-junction)
2. [Key Features](#key-features)
3. [How the Platform Works](#how-the-platform-works)
4. [Visual Architecture](#visual-architecture)
5. [Technology Stack](#technology-stack)
6. [Pages & Screens Overview](#pages--screens-overview)
7. [Data Flow](#data-flow)
8. [Security Features](#security-features)

---

## What is Wedding Junction?

Wedding Junction is an **online marketplace** that connects couples planning their wedding with professional wedding vendors. Think of it as a "one-stop shop" where you can browse, compare, and book everything you need for your wedding - from venues and caterers to photographers and makeup artists.

### Who is it for?

| User Type | Description |
|-----------|-------------|
| **Couples (Customers)** | People planning their wedding who want to find and book vendors easily |
| **Vendors** | Wedding service providers (photographers, caterers, decorators, etc.) who want to showcase their services and get bookings |
| **Administrators** | Platform managers who oversee operations, approve vendors, and manage the marketplace |

### What Problem Does it Solve?

- **For Couples**: Instead of calling dozens of vendors, visiting multiple websites, and managing everything in spreadsheets, couples can browse all vendors in one place, compare prices, read reviews, chat directly, and book services - all within a single platform.

- **For Vendors**: Instead of relying solely on word-of-mouth or maintaining their own website, vendors get access to a ready audience of engaged couples actively looking for wedding services.

---

## Key Features

### 1. Vendor Discovery & Browsing

Browse wedding vendors by category:
- **Venues** - Wedding halls, outdoor spaces, banquet facilities
- **Catering** - Food and beverage services
- **Photography** - Wedding photographers and videographers
- **Makeup & Beauty** - Bridal makeup artists and stylists
- **Decor** - Wedding decorators and planners

Each vendor profile shows:
- Photos and portfolio gallery
- Service descriptions and packages
- Pricing information
- Customer reviews and ratings
- Contact and booking options

### 2. Booking System

The platform handles the entire booking process:
- **Request a Booking** - Customers select their event date and preferred services
- **Vendor Confirmation** - Vendors review and accept/decline booking requests
- **Status Tracking** - Both parties can track booking status (pending, confirmed, completed)
- **Booking History** - View all past and upcoming bookings

### 3. Real-Time Chat

Built-in messaging system allows:
- Direct communication between customers and vendors
- Sharing images and documents
- Discussing custom requirements
- Negotiating prices
- Converting conversations into bookings

### 4. User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Browse vendors, make bookings, chat with vendors, leave reviews |
| **Vendor** | Manage profile, respond to bookings, chat with customers, view dashboard |
| **Admin** | Manage all users, approve vendor applications, manage categories/services |

### 5. Reviews & Ratings

- Customers can rate vendors after completed bookings
- Star ratings (1-5) with written reviews
- Vendors can respond to reviews
- Reviews help other couples make informed decisions

### 6. Payment Processing

- Secure payment collection
- Multiple payment options
- Payment tracking and receipts
- Refund handling for cancellations

---

## How the Platform Works

### Customer Journey

```
1. BROWSE          2. SELECT           3. BOOK            4. PAY             5. CHAT & REVIEW
   |                  |                   |                  |                  |
   v                  v                   v                  v                  v
+--------+       +----------+       +----------+       +----------+       +----------+
| View   |  -->  | View     |  -->  | Request  |  -->  | Complete |  -->  | Message  |
| all    |       | vendor   |       | booking  |       | payment  |       | vendor & |
|vendors |       | details  |       | for date |       |          |       | review   |
+--------+       +----------+       +----------+       +----------+       +----------+
```

**Step-by-step:**
1. **Browse**: Customer visits the platform and browses vendors by category
2. **Select**: Customer views vendor details, portfolio, reviews, and pricing
3. **Book**: Customer selects a date and requests a booking
4. **Pay**: After vendor confirms, customer completes payment
5. **Connect**: Customer can chat with vendor for coordination and leave a review after the event

### Vendor Journey

```
1. APPLY           2. GET APPROVED     3. SETUP PROFILE    4. MANAGE          5. GROW
   |                  |                   |                   |                  |
   v                  v                   v                   v                  v
+--------+       +----------+       +----------+       +----------+       +----------+
| Submit |  -->  | Admin    |  -->  | Add      |  -->  | Accept   |  -->  | Get      |
| vendor |       | reviews  |       | photos,  |       | bookings |       | reviews  |
| form   |       | & approves|      | pricing  |       | & chat   |       | & grow   |
+--------+       +----------+       +----------+       +----------+       +----------+
```

**Step-by-step:**
1. **Apply**: Service provider fills out vendor application form
2. **Approval**: Admin reviews and approves the application
3. **Setup**: Vendor completes their profile with photos, descriptions, and pricing
4. **Manage**: Vendor receives booking requests and manages them through dashboard
5. **Grow**: Good service leads to positive reviews and more bookings

### Admin Journey

```
+-------------------+       +------------------+       +------------------+
| DASHBOARD         |       | MANAGE VENDORS   |       | MANAGE PLATFORM  |
| - View statistics |  <->  | - Approve apps   |  <->  | - Categories     |
| - Monitor activity|       | - Edit profiles  |       | - Services       |
| - Track bookings  |       | - Remove vendors |       | - System settings|
+-------------------+       +------------------+       +------------------+
```

---

## Visual Architecture

### How the System is Organized

```
+--------------------------------------------------+
|                    USERS                          |
|     (Customers, Vendors, Admins using browsers)   |
+--------------------------------------------------+
                         |
                         | Internet
                         v
+--------------------------------------------------+
|              FRONTEND (What Users See)            |
|                                                   |
|  +----------+  +----------+  +----------+        |
|  |  Home    |  |  Vendor  |  |  Admin   |        |
|  |  Page    |  |  Pages   |  |  Panel   |        |
|  +----------+  +----------+  +----------+        |
|                                                   |
|  Built with: React (interactive user interface)   |
+--------------------------------------------------+
                         |
                         | API Requests
                         v
+--------------------------------------------------+
|              BACKEND (Processing Engine)          |
|                                                   |
|  +----------+  +----------+  +----------+        |
|  |  User    |  | Booking  |  |   Chat   |        |
|  |  Auth    |  | System   |  |  System  |        |
|  +----------+  +----------+  +----------+        |
|                                                   |
|  Built with: Node.js + Express (handles logic)    |
+--------------------------------------------------+
                         |
                         | Database Queries
                         v
+--------------------------------------------------+
|              DATABASE (Data Storage)              |
|                                                   |
|  +----------+  +----------+  +----------+        |
|  |  Users   |  | Vendors  |  | Bookings |        |
|  +----------+  +----------+  +----------+        |
|                                                   |
|  Built with: MongoDB (stores all information)     |
+--------------------------------------------------+
                         |
                         v
+--------------------------------------------------+
|           EXTERNAL SERVICES                       |
|  +----------------+  +--------------------+       |
|  | Cloudinary     |  | Email Service      |       |
|  | (Image Storage)|  | (Notifications)    |       |
|  +----------------+  +--------------------+       |
+--------------------------------------------------+
```

### Simple Explanation

| Layer | What it Does | Analogy |
|-------|-------------|---------|
| **Frontend** | The website you see and interact with | The storefront window |
| **Backend** | Processes your requests and business logic | The staff behind the counter |
| **Database** | Stores all the data permanently | The filing cabinet |
| **External Services** | Special tasks like image storage | Delivery partners |

---

## Technology Stack

### What Technologies Are Used?

| Technology | What It Is | Why It's Used |
|------------|-----------|---------------|
| **React** | A popular tool for building websites | Creates a fast, interactive user experience |
| **Node.js** | A program that runs JavaScript on servers | Powers the backend logic efficiently |
| **Express** | A framework for Node.js | Makes building the API easier and faster |
| **MongoDB** | A database system | Stores all vendor, user, and booking data |
| **Socket.io** | Real-time communication tool | Enables instant chat messaging |
| **TailwindCSS** | A styling framework | Makes the website look professional |
| **JWT** | Security tokens | Keeps user sessions secure |
| **Cloudinary** | Cloud image service | Stores and delivers vendor photos |

### Why These Choices?

- **Modern & Popular**: These are industry-standard tools used by many companies
- **Scalable**: The platform can grow to handle more users without major changes
- **Secure**: Built-in security features protect user data
- **Fast**: Optimized for quick page loads and responsive interactions

---

## Pages & Screens Overview

### Public Pages (Anyone Can Access)

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Landing page with featured vendors and categories |
| **Login** | `/login` | User sign-in page |
| **Signup** | `/signup` | New user registration |
| **Vendors List** | `/vendors` | Browse all vendors |
| **Vendor Details** | `/vendors/:id` | Individual vendor profile page |
| **Categories** | `/categories` | Browse by category |
| **Category Details** | `/category/:name` | Vendors in specific category |
| **Services** | `/services` | Browse available services |
| **Forgot Password** | `/forgot-password` | Password recovery |
| **Reset Password** | `/reset-password/:token` | Set new password |
| **Terms of Service** | `/terms` | Legal terms |
| **Privacy Policy** | `/privacy` | Privacy information |
| **Cookies Policy** | `/cookies` | Cookie usage policy |

### Customer Pages (Logged-in Customers)

| Page | URL | Description |
|------|-----|-------------|
| **My Bookings** | `/bookings` | View and manage bookings |
| **Payment** | `/payment/:bookingId` | Complete booking payment |
| **Payment Success** | `/payment-success` | Payment confirmation |
| **Chat** | `/chat` | Message center with vendors |
| **Become Vendor** | `/become-vendor` | Apply to become a vendor |

### Vendor Pages (Approved Vendors)

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | `/vendor/dashboard` | Overview of bookings, earnings, stats |
| **Bookings** | `/vendor/bookings` | Manage customer bookings |
| **Profile** | `/vendor/profile` | Edit vendor profile and photos |
| **Chat** | `/chat` | Message center with customers |

### Admin Pages (Administrators Only)

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | `/admin` | Platform statistics and overview |
| **Manage Vendors** | `/admin/vendors` | Approve, edit, remove vendors |
| **Manage Categories** | `/admin/categories` | Add, edit, delete categories |
| **Manage Services** | `/admin/services` | Add, edit, delete services |

---

## Data Flow

### How Information Moves Through the System

#### Example: Customer Books a Vendor

```
Customer                    Website                    Server                    Database
   |                           |                          |                          |
   |  1. Clicks "Book Now"     |                          |                          |
   |-------------------------->|                          |                          |
   |                           |  2. Sends booking        |                          |
   |                           |     request              |                          |
   |                           |------------------------->|                          |
   |                           |                          |  3. Saves booking        |
   |                           |                          |------------------------->|
   |                           |                          |                          |
   |                           |                          |  4. Confirms saved       |
   |                           |                          |<-------------------------|
   |                           |  5. Returns success      |                          |
   |                           |<-------------------------|                          |
   |  6. Shows confirmation    |                          |                          |
   |<--------------------------|                          |                          |
```

#### Example: Vendor Receives Notification

```
Database         Server           Vendor's Browser
    |               |                    |
    | 1. New booking|                    |
    |   stored      |                    |
    |-------------->|                    |
    |               | 2. Sends real-time |
    |               |    notification    |
    |               |------------------->|
    |               |                    | 3. Shows "New
    |               |                    |    Booking!" alert
```

### What Data is Stored?

| Data Type | Examples | Where |
|-----------|----------|-------|
| **User Accounts** | Email, password (encrypted), name | Users collection |
| **Vendor Profiles** | Business name, description, photos, pricing | Vendors collection |
| **Bookings** | Date, customer, vendor, status, price | Bookings collection |
| **Reviews** | Rating, comment, customer, vendor | Reviews collection |
| **Messages** | Chat history between users | Messages collection |
| **Categories** | Venues, Photography, Catering, etc. | Categories collection |

---

## Security Features

### How We Protect Your Data

| Security Measure | What It Does | Why It Matters |
|-----------------|--------------|----------------|
| **Password Encryption** | Passwords are scrambled before storage | Even if data is stolen, passwords can't be read |
| **JWT Authentication** | Secure login tokens | Only verified users can access their accounts |
| **Rate Limiting** | Limits login attempts | Prevents automated attacks |
| **Input Sanitization** | Cleans user inputs | Blocks injection attacks |
| **HTTPS Encryption** | Encrypts data in transit | Information can't be intercepted |
| **Security Headers** | Browser protection settings | Prevents common web attacks |

### Data Protection Practices

- **Passwords are never stored in plain text** - They are encrypted using industry-standard methods
- **Sensitive data is validated** - All inputs are checked before processing
- **Session management** - Login sessions expire for security
- **Admin-only access** - Sensitive operations require administrator privileges
- **Secure file uploads** - Images are validated and stored safely in the cloud

### What We Don't Store

- Full credit card numbers (handled by payment processor)
- Plain-text passwords
- Unnecessary personal information

---

## Summary

Wedding Junction is a complete wedding vendor marketplace that:

- **Connects** couples with wedding vendors in one convenient place
- **Simplifies** the booking and payment process
- **Enables** direct communication between customers and vendors
- **Provides** vendor management tools for service providers
- **Ensures** security and reliability for all users

The platform is built with modern, industry-standard technologies and follows best practices for security and user experience.

---

*For technical setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)*
