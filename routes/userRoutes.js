const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizationMiddleware');

const router = express.Router();

// All user routes require authentication and admin role
router.use(authMiddleware);
router.use(authorizeRole('admin'));

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', userController.updateUser);

// Change user role
router.patch('/:id/role', userController.changeUserRole);

// Toggle user status (active/inactive)
router.patch('/:id/status', userController.toggleUserStatus);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
