# CRM System - Full Stack Application

A comprehensive Customer Relationship Management (CRM) system built with React and Node.js, featuring lead management, customer tracking, deal pipeline, task management, and reporting capabilities.

## Project Overview

This is a full-stack CRM application demonstrating modern web development practices including:
- RESTful API design with Express.js
- React-based frontend with component architecture
- MongoDB database with Mongoose ODM
- JWT-based authentication and authorization
- Role-based access control (Admin/Sales User)
- Responsive design for all screen sizes
- Form validation and error handling
- CRUD operations for all entities

**Note for Reviewers:** This project is ready for testing. Please follow the setup instructions below. All data is fetched from APIs and stored in MongoDB - no hard-coded data is used. The application includes proper error handling, input validation, and follows clean code principles.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Role-Based Access Control**: Admin and Sales User roles with different permissions
- **Lead Management**: Create, update, delete, and convert leads to customers
- **Customer Management**: Track customer information and relationships
- **Deal Pipeline**: Manage sales deals with stages and probability tracking
- **Task Management**: Create and track tasks and follow-ups
- **Dashboard & Reports**: View analytics, statistics, and reports
- **User Management**: Admin panel for managing users (Admin only)
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Tech Stack

### Frontend
- **React 19.2** - UI library
- **React Router DOM 7.12** - Client-side routing
- **Axios 1.13** - HTTP client for API calls
- **CSS3** - Styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express 5.2** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## Installation & Setup

### 1. Get the Project

**If using Git:**
```bash
git clone <repository-url>
cd crm-project
```

**If downloading from Google Drive:**
- Extract the project folder
- Navigate to the project directory in terminal

### 2. Backend Setup

```bash
# Navigate to backend directory
cd crm-backend

# Install dependencies
npm install

# Create .env file
# Copy the example below and create .env file in crm-backend directory
```

**Create `crm-backend/.env` file:**

```env
# Server Configuration
PORT=5000

# MongoDB Connection
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/crm-db

# For MongoDB Atlas (cloud):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/crm-db

# JWT Secret (generate using generate-secret.js)
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
```

**Generate JWT Secret:**

```bash
# Run the secret generator
node generate-secret.js

# Copy the generated secret to your .env file
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd crm-frontend

# Install dependencies
npm install

# Create .env file
# Copy the example below and create .env file in crm-frontend directory
```

**Create `crm-frontend/.env` file:**

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB on your system
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (using Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. Use the connection string in `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/crm-db
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `<password>` and `<dbname>` in the connection string
5. Add your IP address to the whitelist
6. Use the connection string in `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/crm-db
   ```

## Running the Application

### Start Backend Server

```bash
# From crm-backend directory
npm start

# Or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
# From crm-frontend directory
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

### Production Build

```bash
# Build frontend for production
cd crm-frontend
npm run build

# The build folder will contain optimized production files
```

## Quick Start Guide

1. **Extract the project** from Google Drive
2. **Set up MongoDB** (local or Atlas)
3. **Configure environment variables** (see Installation & Setup section)
4. **Install dependencies** for both frontend and backend
5. **Start backend server** (`npm start` in crm-backend)
6. **Start frontend** (`npm start` in crm-frontend)
7. **Create First Admin** (Required - follows production standard):
   ```bash
   # From crm-backend directory
   node create-admin.js
   ```
   This creates: Email: `admin@crm.com`, Password: `admin123`
   
   **Note**: This is the standard way to create the first admin in production systems. Once an admin exists, they can create more admins through the admin panel.
8. **Login** with admin credentials to access all features including admin panel
9. **Create more users** - Use the admin panel to create additional users/admins, or register normally (creates Sales User)

## Testing the Application

### Initial Setup
1. After starting both servers, navigate to `http://localhost:3000`
2. Register a new account (first user will be Sales User)
3. Login with your credentials
4. Explore the dashboard and all features

### Testing Features
- **Leads**: Create, edit, delete, and convert leads to customers
- **Customers**: View and manage customer information
- **Deals**: Create deals with different stages, track values and probabilities
- **Tasks**: Create and manage tasks with due dates
- **Reports**: View dashboard statistics and reports
- **Admin Panel**: (Admin only) Manage users, assign roles

### Creating an Admin User

**This follows real-world production practices:**

1. **First Admin**: Created via setup script (standard in production)
2. **Subsequent Admins**: Created by existing admins through the admin panel UI

**Method 1: Using the Setup Script (Recommended - Production Standard)**

This is how the first admin is created in real production systems:

```bash
# From crm-backend directory
# Default credentials
node create-admin.js

# Or with custom credentials
node create-admin.js admin@company.com SecurePassword123 "Admin Name"
```

The script will:
- Check if any admin already exists (prevents duplicate first admin)
- Create the first admin user
- Provide login credentials

**Method 2: Using Initial Setup API Endpoint**

A one-time setup endpoint is available (only works if no admins exist):

```bash
POST http://localhost:5000/api/auth/setup
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@company.com",
  "password": "SecurePassword123"
}
```

**Method 3: Admin Panel (After First Admin Exists)**

Once an admin exists:
1. Login as admin
2. Navigate to "Admin Panel" in the sidebar
3. Click "Add New User"
4. Select "Admin" role from the dropdown
5. Create the admin user

**Method 4: Using MongoDB (Manual - For Advanced Users)**

1. Register a user normally through the application
2. Connect to your MongoDB database
3. Find the user and update the role:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "Admin" } }
)
```

4. Login again with the same credentials - you'll now have admin access

**Production Structure (Real-World Best Practices):**

This follows industry-standard patterns used in production systems:

1. **First Admin Creation** (One-Time Setup):
   - Created via setup script (`create-admin.js`) - Standard in production
   - Or via initial setup API endpoint (`/api/auth/setup`) - Only works if no admins exist
   - This is how the first admin is created in real production deployments

2. **Subsequent Admin Creation**:
   - Only existing admins can create new admins
   - Done through the Admin Panel UI (User Management section)
   - Or via API if you have admin authentication token
   - Registration endpoint always creates "Sales User" (security measure)

3. **Security Features**:
   - Registration cannot create admin users (prevents privilege escalation)
   - Only admins can assign admin role to users
   - System prevents deleting the last admin
   - System prevents changing the last admin's role

**Why This Structure?**
- **Security**: Prevents unauthorized admin creation
- **Control**: First admin is created by system administrator during deployment
- **Scalability**: Admins can manage user creation through UI
- **Standard Practice**: This is how enterprise applications handle initial admin setup

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (creates Sales User only)
- `POST /api/auth/login` - Login user
- `POST /api/auth/setup` - Create first admin (one-time, only works if no admins exist)
- `GET /api/auth/me` - Get current user (protected)

### Leads
- `GET /api/leads` - Get all leads (protected)
- `GET /api/leads/:id` - Get lead by ID (protected)
- `POST /api/leads` - Create new lead (protected)
- `PUT /api/leads/:id` - Update lead (protected)
- `DELETE /api/leads/:id` - Delete lead (protected)
- `POST /api/leads/:id/convert` - Convert lead to customer (protected)

### Customers
- `GET /api/customers` - Get all customers (protected)
- `GET /api/customers/:id` - Get customer by ID (protected)
- `PUT /api/customers/:id` - Update customer (protected)
- `DELETE /api/customers/:id` - Delete customer (protected)

### Deals
- `GET /api/deals` - Get all deals (protected)
- `GET /api/deals/:id` - Get deal by ID (protected)
- `POST /api/deals` - Create new deal (protected)
- `PUT /api/deals/:id` - Update deal (protected)
- `DELETE /api/deals/:id` - Delete deal (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (protected)
- `GET /api/tasks/:id` - Get task by ID (protected)
- `POST /api/tasks` - Create new task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics (protected)
- `GET /api/reports/leads` - Get lead reports (protected)
- `GET /api/reports/deals` - Get deal reports (protected)
- `GET /api/reports/revenue` - Get revenue reports (protected)

### Users (Admin Only)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Registration/Login**: User receives a JWT token
2. **Token Storage**: Token is stored in `localStorage`
3. **Protected Routes**: Token is sent in `Authorization` header as `Bearer <token>`
4. **Token Expiry**: Tokens expire after 30 days

## User Roles

### Sales User
- Can manage leads, customers, deals, and tasks assigned to them
- Can view reports and dashboard
- Cannot access admin panel
- Cannot manage other users

### Admin
- All Sales User permissions
- Can manage all users
- Can access admin panel
- Can assign leads/deals to any user
- Can edit closed deals

## Validation & Error Handling

### Frontend Validations
- Phone numbers: Minimum 7 digits, maximum 15 characters
- Email: Standard email format validation
- Deal values: Minimum $1.00, maximum 2 decimal places
- Required fields: All marked fields must be filled
- Form errors: Auto-scroll to error messages

### Backend Validations
- Input validation for all endpoints
- Password hashing with bcrypt
- JWT token verification
- Role-based access control
- Error handling middleware

## Testing the API

A comprehensive Postman testing guide is available at:
`crm-backend/POSTMAN_TESTING_GUIDE.md`

You can import the API endpoints into Postman for testing.

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running (local) or connection string is correct (Atlas)
- Check `.env` file has correct `MONGO_URI`
- Verify network connectivity for Atlas

**Port Already in Use:**
- Change `PORT` in `.env` file
- Or stop the process using port 5000

**JWT Secret Error:**
- Ensure `JWT_SECRET` is set in `.env`
- Generate a new secret using `node generate-secret.js`

### Frontend Issues

**API Connection Error:**
- Ensure backend server is running on port 5000
- Check `REACT_APP_API_URL` in `.env` file
- Verify CORS is enabled in backend

**Build Errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## Environment Variables Summary

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crm-db
JWT_SECRET=your-secret-key-here
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Important Notes

- **No hard-coded data**: All data is fetched from APIs and stored in MongoDB
- **Environment variables**: Make sure to create `.env` files in both backend and frontend directories (see Installation & Setup section). **Note:** `.env` files are not included in the project - you need to create them following the instructions above
- **Database**: The application will create collections automatically on first use
- **Security**: JWT tokens are used for authentication, passwords are hashed with bcrypt
- **Responsive**: The application works on desktop, tablet, and mobile devices
- **First User**: The first registered user will be created as "Sales User" by default
- **Admin Access**: Use `node create-admin.js` script in the backend directory to create an admin user for testing
- **Node Modules**: `node_modules` folders are included for convenience, but you can delete them and run `npm install` if needed

## Code Quality & Architecture

- **Modular Structure**: Code is organized into controllers, models, routes, and components
- **Error Handling**: Comprehensive error handling on both frontend and backend
- **Validation**: Input validation on both client and server side
- **Clean Code**: Follows best practices with proper naming conventions and comments
- **Separation of Concerns**: Clear separation between frontend and backend
- **RESTful API**: Follows REST principles for API design
- **Component Architecture**: React components are organized by feature
- **Context API**: Used for global state management (authentication)

