# Postman Testing Guide for CRM Backend API

Complete guide to test all API endpoints using Postman.

---

## 📋 Prerequisites

1. **Start your server:**
   ```bash
   cd crm-backend
   npm start
   ```
   Server should run on `http://localhost:5000`

2. **Install Postman:**
   - Download from [postman.com](https://www.postman.com/downloads/)
   - Or use Postman web version

3. **Create a new Postman Collection:**
   - Click "New" → "Collection"
   - Name it "CRM Backend API"

---

## 🔐 Step 1: Authentication Setup

### 1.1 Register a New User

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/register`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "Admin"
  }
  ```

**Expected Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin"
  }
}
```

**📝 Important:** Copy the `token` value! You'll need it for protected routes.

---

### 1.2 Login

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

**Expected Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin"
  }
}
```

---

### 1.3 Get Current User (Protected Route)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/auth/me`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin"
  }
}
```

---

## 🎯 Step 2: Setting Up Authorization in Postman

### Method 1: Manual (Quick Testing)

1. Copy your token from login/register response
2. For each protected request, add header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

### Method 2: Environment Variables (Recommended)

1. **Create Environment:**
   - Click "Environments" → "Create Environment"
   - Name: "CRM Local"
   - Add variable:
     - Variable: `token`
     - Initial Value: (leave empty)
     - Current Value: (paste token after login)

2. **Use in Requests:**
   - In Authorization tab, select "Bearer Token"
   - Token: `{{token}}`

3. **Auto-save token:**
   - After login request, add this to "Tests" tab:
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       if (jsonData.token) {
           pm.environment.set("token", jsonData.token);
       }
   }
   ```

---

## 📊 Step 3: Testing All Endpoints

### 🎯 LEADS API

#### Get All Leads
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/leads`
- **Headers:** `Authorization: Bearer {{token}}`

#### Get Single Lead
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/leads/LEAD_ID_HERE`
- **Headers:** `Authorization: Bearer {{token}}`

#### Create Lead
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/leads`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "123-456-7890",
    "company": "Acme Corp",
    "source": "Website",
    "notes": "Interested in our product"
  }
  ```

#### Update Lead
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/leads/LEAD_ID_HERE`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "status": "Qualified",
    "notes": "Updated notes"
  }
  ```

#### Convert Lead to Customer
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/leads/LEAD_ID_HERE/convert`
- **Headers:** `Authorization: Bearer {{token}}`

#### Delete Lead (Admin Only)
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/leads/LEAD_ID_HERE`
- **Headers:** `Authorization: Bearer {{token}}`

---

### 👥 CUSTOMERS API

#### Get All Customers
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/customers`
- **Headers:** `Authorization: Bearer {{token}}`

#### Get Single Customer
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/customers/CUSTOMER_ID_HERE`
- **Headers:** `Authorization: Bearer {{token}}`

#### Update Customer
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/customers/CUSTOMER_ID_HERE`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Updated Name",
    "phone": "987-654-3210",
    "address": "123 Main St"
  }
  ```

#### Delete Customer (Admin Only)
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/customers/CUSTOMER_ID_HERE`
- **Headers:** `Authorization: Bearer {{token}}`

---

### 💼 DEALS API

#### Get All Deals
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/deals`
- **Headers:** `Authorization: Bearer {{token}}`

#### Get Single Deal
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/deals/DEAL_ID_HERE`
- **Headers:** `Authorization: Bearer {{token}}`

#### Create Deal
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/deals`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "title": "Enterprise Package",
    "value": 50000,
    "customer": "CUSTOMER_ID_HERE",
    "stage": "Prospecting",
    "probability": 25,
    "expectedCloseDate": "2024-12-31",
    "notes": "Large enterprise client"
  }
  ```

#### Update Deal
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/deals/DEAL_ID_HERE`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "stage": "Negotiation",
    "probability": 75,
    "value": 55000
  }
  ```

#### Delete Deal (Admin Only)
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/deals/DEAL_ID_HERE`
- **Headers:** `Authorization: Bearer {{token}}`

---

### ✅ TASKS API

#### Get All Tasks
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/tasks`
- **Headers:** `Authorization: Bearer {{token}}`

#### Get Single Task
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/tasks/TASK_ID_HERE`
- **Headers:** `Authorization: Bearer {{token}}`

#### Create Task
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/tasks`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "title": "Follow up with client",
    "description": "Call to discuss proposal",
    "type": "Call",
    "priority": "High",
    "status": "Pending",
    "dueDate": "2024-12-20T10:00:00Z",
    "relatedTo": "Deal",
    "relatedId": "DEAL_ID_HERE"
  }
  ```

#### Update Task
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/tasks/TASK_ID_HERE`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Body (raw JSON):**
  ```json
  {
    "status": "Completed",
    "priority": "Medium"
  }
  ```

#### Delete Task
- **Method:** `DELETE`
- **URL:** `http://localhost:5000/api/tasks/TASK_ID_HERE`
- **Headers:** `Authorization: Bearer {{token}}`

---

### 📈 REPORTS API

#### Get Dashboard Summary
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/reports/dashboard`
- **Headers:** `Authorization: Bearer {{token}}`

#### Get Lead Reports
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/reports/leads`
- **Headers:** `Authorization: Bearer {{token}}`

#### Get Deal Reports
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/reports/deals`
- **Headers:** `Authorization: Bearer {{token}}`

#### Get Revenue Reports
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/reports/revenue`
- **Headers:** `Authorization: Bearer {{token}}`

---

## 🎨 Postman Collection Setup

### Create a Complete Collection:

1. **Create Collection:** "CRM Backend API"

2. **Organize Folders:**
   - 📁 Authentication
     - Register
     - Login
     - Get Me
   - 📁 Leads
     - Get All Leads
     - Get Single Lead
     - Create Lead
     - Update Lead
     - Convert Lead
     - Delete Lead
   - 📁 Customers
     - Get All Customers
     - Get Single Customer
     - Update Customer
     - Delete Customer
   - 📁 Deals
     - Get All Deals
     - Get Single Deal
     - Create Deal
     - Update Deal
     - Delete Deal
   - 📁 Tasks
     - Get All Tasks
     - Get Single Task
     - Create Task
     - Update Task
     - Delete Task
   - 📁 Reports
     - Dashboard
     - Lead Reports
     - Deal Reports
     - Revenue Reports

3. **Set Collection Variables:**
   - `base_url`: `http://localhost:5000`
   - `token`: (will be set automatically)

4. **Use Variables in URLs:**
   ```
   {{base_url}}/api/auth/login
   ```

---

## 🔧 Advanced: Auto-Save Token Script

Add this to your **Login** request in "Tests" tab:

```javascript
// Auto-save token to environment
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("token", jsonData.token);
        console.log("Token saved to environment!");
    }
}
```

---

## 📝 Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get current user (protected route)
- [ ] Test invalid credentials

### Leads
- [ ] Create lead
- [ ] Get all leads
- [ ] Get single lead
- [ ] Update lead
- [ ] Convert lead to customer
- [ ] Delete lead (Admin only)

### Customers
- [ ] Get all customers
- [ ] Get single customer
- [ ] Update customer
- [ ] Delete customer (Admin only)

### Deals
- [ ] Create deal
- [ ] Get all deals
- [ ] Get single deal
- [ ] Update deal
- [ ] Delete deal (Admin only)

### Tasks
- [ ] Create task
- [ ] Get all tasks
- [ ] Get single task
- [ ] Update task
- [ ] Delete task

### Reports
- [ ] Dashboard summary
- [ ] Lead reports
- [ ] Deal reports
- [ ] Revenue reports

---

## ⚠️ Common Issues

### "Not authorized" Error
- **Problem:** Missing or invalid token
- **Solution:** 
  1. Login again to get new token
  2. Check Authorization header format: `Bearer YOUR_TOKEN`
  3. Make sure token is not expired

### "User not found" Error
- **Problem:** Invalid user ID in token
- **Solution:** Register/login again

### "Not authorized to access this route"
- **Problem:** User doesn't have required role
- **Solution:** Use Admin account for admin-only routes

### Connection Refused
- **Problem:** Server not running
- **Solution:** Start server with `npm start`

---

## 🚀 Quick Start Testing Flow

1. **Start Server:**
   ```bash
   cd crm-backend
   npm start
   ```

2. **Register/Login:**
   - POST `/api/auth/register` or `/api/auth/login`
   - Copy the token

3. **Set Authorization:**
   - Add header: `Authorization: Bearer YOUR_TOKEN`

4. **Test Endpoints:**
   - Start with GET requests (easier)
   - Then try POST to create data
   - Use created IDs for PUT/DELETE

5. **Check Responses:**
   - Status codes (200, 201, 400, 401, 403, 404, 500)
   - Response body structure
   - Error messages

---

## 📚 Example Complete Flow

1. **Register Admin User:**
   ```
   POST /api/auth/register
   Body: { "name": "Admin", "email": "admin@test.com", "password": "admin123", "role": "Admin" }
   ```

2. **Create Lead:**
   ```
   POST /api/leads
   Body: { "name": "Test Lead", "email": "lead@test.com", "phone": "1234567890", "source": "Website" }
   ```

3. **Convert Lead to Customer:**
   ```
   POST /api/leads/LEAD_ID/convert
   ```

4. **Create Deal:**
   ```
   POST /api/deals
   Body: { "title": "Test Deal", "value": 10000, "customer": "CUSTOMER_ID" }
   ```

5. **Create Task:**
   ```
   POST /api/tasks
   Body: { "title": "Follow up", "type": "Call", "dueDate": "2024-12-31", "relatedTo": "Deal", "relatedId": "DEAL_ID" }
   ```

6. **View Dashboard:**
   ```
   GET /api/reports/dashboard
   ```

---

Happy Testing! 🎉

