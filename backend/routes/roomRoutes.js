const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Mengarahkan URL endpoint ke fungsi controller yang sesuai
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;