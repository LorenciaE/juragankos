const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById); // Pastikan ini ada
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment); // Pastikan ini ada
router.delete('/:id', paymentController.deletePayment);

module.exports = router;