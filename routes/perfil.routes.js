// routes/perfil.routes.js
const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfil.controller');

router.get('/perfil', perfilController.getPerfil);

module.exports = router;
