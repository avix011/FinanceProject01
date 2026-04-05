require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Role = require('./models/Role');
const User = require('./models/User');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize database and seed data
const initDB = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Database connected successfully');

    // Seed roles
    await Role.seedRoles();
    console.log('Roles seeded successfully');

    // Create default admin user if it doesn't exist
    const adminRole = await Role.findOne({ name: 'admin' });
    const adminExists = await User.findOne({ email: 'admin@finance.dev' });

    if (!adminExists && adminRole) {
      const adminUser = new User({
        email: 'admin@finance.dev',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: adminRole._id,
        status: 'active',
      });
      await adminUser.save();
      console.log('Default admin user created: admin@finance.dev / admin123');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

// Initialize database before starting server
initDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Data Processing and Access Control Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      records: '/api/records',
      users: '/api/users (admin only)',
      dashboard: '/api/dashboard',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Visit http://localhost:${PORT} for API documentation`);
});
