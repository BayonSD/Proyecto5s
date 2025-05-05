// routes/tarjeta.routes.js
const express = require('express');
const router = express.Router();
const tarjetaController = require('../controllers/tarjeta.controller');

router.get('/tarjetas/:user_id', tarjetaController.getTarjetasByUser);
router.post('/tarjetas', tarjetaController.addTarjeta);

module.exports = router;
