const express = require('express');
const recordController = require('../controllers/recordController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorizationMiddleware');

const router = express.Router();

// All record routes require authentication
router.use(authMiddleware);

// Create record (Analyst and Admin)
router.post('/', authorize('create:records'), recordController.createRecord);

// Get all records (with role-based access)
router.get('/', authorize('read:records'), recordController.getRecords);

// Get single record
router.get('/:id', authorize('read:records'), recordController.getRecord);

// Update record (Analyst can update own, Admin can update all)
router.put('/:id', authorize('update:own_records', 'update:records'), recordController.updateRecord);

// Delete record (Admin only)
router.delete('/:id', authorize('delete:records'), recordController.deleteRecord);

module.exports = router;
