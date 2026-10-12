const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// All voucher routes require authentication
router.use(verifyToken);

// List vouchers with role-based restrictions and multi-criteria filters
router.get('/', voucherController.getVouchers);

// Get single voucher details
router.get('/:id', voucherController.getVoucherById);

// Employee actions
router.post('/', requireRole('employee'), upload.single('signature'), voucherController.createVoucher);
router.put('/:id', requireRole('employee'), upload.single('signature'), voucherController.updateVoucher);
router.post('/:id/submit', requireRole('employee'), upload.single('signature'), voucherController.submitVoucher);
router.delete('/:id', requireRole('employee'), voucherController.deleteVoucher);

// Director actions
router.post('/:id/approve', requireRole('director'), upload.single('signature'), voucherController.approveVoucher);
router.post('/:id/reject', requireRole('director'), voucherController.rejectVoucher);

module.exports = router;
