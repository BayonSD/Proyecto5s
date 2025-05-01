// routes/direccion.routes.js
const express = require('express');
const router = express.Router();
const direccionController = require('../controllers/direccion.controller');

router.get('/direccion/:user_id', direccionController.getDireccionesByUser);
router.post('/direccion', direccionController.addDireccion);

module.exports = router;
