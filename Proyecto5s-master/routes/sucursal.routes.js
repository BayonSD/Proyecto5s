// routes/sucursal.routes.js
const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursal.controller');

router.get('/sucursales', sucursalController.getAll);
router.get('/api/sucursales', sucursalController.getAllAPI);
router.get('/sucursal/:id', sucursalController.getById);
router.get('/api/sucursal/:id', sucursalController.getByIdAPI);
router.post('/sucursal', sucursalController.create);
router.put('/sucursal/:id', sucursalController.update);
router.put('/api/sucursal/:id', sucursalController.updateAPI);
router.delete('/sucursal/:id', sucursalController.delete);

module.exports = router;
