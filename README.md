# Finance Data Processing and Access Control Backend

A comprehensive backend system for managing financial records with role-based access control (RBAC), built with Node.js, Express, and MongoDB.

## Features

✅ **User Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Viewer, Analyst, Admin)
- User status management (active/inactive)

✅ **Financial Records Management**
- Create, read, update, delete financial records
- Filter by type, category, date range
- Pagination support
- Role-based access to own or all records

✅ **Dashboard Analytics**
- Summary statistics (income, expenses, net balance)
- Category-wise breakdown
- Recent activity tracking
- Monthly trends analysis

✅ **User Management (Admin Only)**
- Create and manage users
- Assign roles and permissions
- Activate/deactivate users
- Change user roles

✅ **Input Validation**
- Joi schema validation
- Business logic validation
- Error handling with meaningful messages

File Structure
Project01/
├── server.js                 # Main entry point
├── package.json             # Dependencies (Express, Mongoose, JWT, Joi, etc.)
├── .env                     # Environment configuration
├── .env.example             # Environment template
├── README.md                # Complete API documentation
├── config/
│   └── database.js          # MongoDB connection setup
├── models/
│   ├── User.js              # User schema with password hashing
│   ├── Role.js              # Role and permissions schema
│   └── FinancialRecord.js   # Financial record schema
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── recordController.js  # Records CRUD
│   └── dashboardController.js # Analytics queries
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   ├── authorizationMiddleware.js # Permission checks
│   └── errorHandler.js      # Global error handling
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── userRoutes.js        # User management endpoints
│   ├── recordRoutes.js      # Records CRUD endpoints
│   └── dashboardRoutes.js   # Dashboard analytics endpoints
├── validators/
│   ├── authValidator.js     # Auth input validation
│   └── recordValidator.js   # Records input validation
└── utils/
    └── errors.js            # Custom error classes

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file from .env.example:
```bash
cp .env.example .env
```

4. Update .env with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Default Admin User

For testing, a default admin user is created:
- **Email**: admin@finance.dev
- **Password**: admin123

⚠️ Change this password in production!

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication Endpoints

#### Register User
```
POST /auth/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer"
  }
}
```

#### Login
```
POST /auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer"
  }
}
```

#### Get Current User Profile
```
GET /auth/me

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "id": "507f1f77...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer",
    "status": "active"
  }
}
```

---

### Financial Records Endpoints

#### Create Record
```
POST /records

Headers:
Authorization: Bearer <token>

Body:
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2024-03-15T10:00:00Z",
  "notes": "Monthly salary",
  "description": "Salary payment"
}

Response:
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "amount": 5000,
    "type": "income",
    "category": "salary",
    "date": "2024-03-15T10:00:00Z",
    "notes": "Monthly salary",
    "createdAt": "2024-03-15T10:00:00Z",
    "updatedAt": "2024-03-15T10:00:00Z"
  }
}
```

#### Get All Records
```
GET /records

Query Parameters:
?type=income              # Filter by type (income/expense)
?category=salary          # Filter by category
?startDate=2024-01-01     # Filter from start date (ISO 8601)
?endDate=2024-03-31       # Filter to end date (ISO 8601)
?limit=50                 # Pagination limit (default: 50)
?page=1                   # Page number (default: 1)

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {...},
      "amount": 5000,
      "type": "income",
      "category": "salary",
      "date": "2024-03-15T10:00:00Z",
      "notes": "Monthly salary",
      "createdAt": "2024-03-15T10:00:00Z",
      "updatedAt": "2024-03-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

#### Get Single Record
```
GET /records/:id

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": {...},
    "amount": 5000,
    "type": "income",
    "category": "salary",
    "date": "2024-03-15T10:00:00Z"
  }
}
```

#### Update Record
```
PUT /records/:id

Headers:
Authorization: Bearer <token>

Body:
{
  "amount": 5500,
  "notes": "Updated salary"
}

Response:
{
  "success": true,
  "message": "Record updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": {...},
    "amount": 5500,
    "type": "income",
    "category": "salary",
    "date": "2024-03-15T10:00:00Z",
    "notes": "Updated salary"
  }
}
```

#### Delete Record
```
DELETE /records/:id

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

### Dashboard Endpoints

#### Get Summary
```
GET /dashboard/summary

Query Parameters:
?startDate=2024-01-01     # Optional date range
?endDate=2024-03-31
?userId=<userId>          # Admin only: get summary for specific user

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalIncome": 10000,
    "totalExpense": 2500,
    "netBalance": 7500,
    "recordCount": 15
  }
}
```

#### Get Category Breakdown
```
GET /dashboard/category-breakdown

Query Parameters:
?startDate=2024-01-01
?endDate=2024-03-31
?type=income              # Optional: income or expense
?userId=<userId>          # Admin only

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "category": "salary",
      "total": 10000,
      "count": 2,
      "type": "income"
    },
    {
      "category": "food",
      "total": 1500,
      "count": 20,
      "type": "expense"
    }
  ]
}
```

#### Get Recent Activity
```
GET /dashboard/recent-activity

Query Parameters:
?limit=10                 # Number of recent records (default: 10)
?userId=<userId>          # Admin only

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {...},
      "amount": 5000,
      "type": "income",
      "category": "salary",
      "date": "2024-03-15T10:00:00Z"
    }
  ]
}
```

#### Get Monthly Trends
```
GET /dashboard/monthly-trends

Query Parameters:
?months=6                 # Number of months to analyze (default: 6)
?userId=<userId>          # Admin only

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "year": 2024,
      "month": 1,
      "type": "income",
      "total": 5000,
      "count": 1
    },
    {
      "year": 2024,
      "month": 1,
      "type": "expense",
      "total": 1000,
      "count": 5
    }
  ]
}
```

#### Get Combined Insights
```
GET /dashboard/insights

Query Parameters:
?startDate=2024-01-01      # Optional
?endDate=2024-12-31        # Optional
?months=6                  # Optional, default 6
?userId=<userId>           # Admin only

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 10000,
      "totalExpense": 4000,
      "netBalance": 6000,
      "recordCount": 25
    },
    "categoryBreakdown": [],
    "monthlyTrends": []
  }
}
```

---

### User Management Endpoints (Admin Only)

#### Get All Users
```
GET /users

Query Parameters:
?status=active            # Filter by status (active/inactive)
?role=viewer              # Filter by role (viewer/analyst/admin)
?limit=50                 # Pagination
?page=1

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439010",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": {
        "_id": "...",
        "name": "viewer",
        "description": "..."
      },
      "status": "active",
      "createdAt": "2024-03-15T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### Get User by ID
```
GET /users/:id

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439010",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": {...},
    "status": "active"
  }
}
```

#### Update User
```
PUT /users/:id

Body:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com"
}

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "User updated successfully",
  "data": {...}
}
```

#### Change User Role
```
PATCH /users/:id/role

Body:
{
  "roleName": "analyst"
}

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "User role updated successfully",
  "data": {...}
}
```

#### Toggle User Status
```
PATCH /users/:id/status

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "User activated successfully",
  "data": {...}
}
```

#### Delete User
```
DELETE /users/:id

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Role-Based Access Control

### Role Permissions Matrix

| Permission | Viewer | Analyst | Admin |
|-----------|--------|---------|-------|
| read:records | ✅ | ✅ | ✅ |
| read:dashboard | ✅ | ✅ | ✅ |
| create:records | ❌ | ✅ | ✅ |
| update:own_records | ❌ | ✅ | ❌ |
| update:records | ❌ | ❌ | ✅ |
| delete:records | ❌ | ❌ | ✅ |
| manage:users | ❌ | ❌ | ✅ |

---

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "details": [
    {
      "field": "fieldName",
      "message": "Field validation message"
    }
  ]
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Financial Record Categories

Supported categories:
- `salary` - Income from employment
- `freelance` - Freelance/contract income
- `investment` - Investment returns
- `food` - Food and groceries
- `transportation` - Transport costs
- `utilities` - Bills and utilities
- `entertainment` - Entertainment expenses
- `health` - Health and medical
- `education` - Education expenses
- `shopping` - Shopping and retail
- `other` - Other transactions

---

## Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: ObjectId (Reference to Role),
  status: String (active/inactive, default: active),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Role Schema
```javascript
{
  _id: ObjectId,
  name: String (enum: viewer, analyst, admin),
  permissions: Array[String],
  description: String,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### FinancialRecord Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (Reference to User),
  amount: Number (required, > 0),
  type: String (income/expense, required),
  category: String (required),
  date: DateTime (required),
  notes: String (max 500 chars),
  description: String,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

## Testing with cURL

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finance.dev",
    "password": "admin123"
  }'
```

### Create a record (replace TOKEN with actual JWT)
```bash
curl -X POST http://localhost:5000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "amount": 5000,
    "type": "income",
    "category": "salary",
    "date": "2024-03-15T10:00:00Z",
    "notes": "Monthly salary"
  }'
```

### Get dashboard summary
```bash
curl -X GET http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer TOKEN"
```

---

## Development Notes

- The project uses MongoDB aggregation pipeline for efficient data analytics
- All sensitive data (passwords) is hashed using bcryptjs
- JWT tokens are valid for 7 days by default
- Records are indexed for efficient queries (userId, date, category)
- Error responses include detailed validation messages
- Admin users can view records and analytics for all users

---

## Security Considerations

- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ JWT-based stateless authentication
- ✅ Role-based access control on all endpoints
- ✅ Input validation using Joi
- ✅ CORS configuration for frontend integration
- ✅ HTTP status codes appropriately used
- ⚠️ Change JWT_SECRET in production
- ⚠️ Use strong passwords for admin accounts
- ⚠️ Enable HTTPS in production

---

## License

ISC

---

## Support

For issues or questions, please create an issue in the repository.
