// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/auth', authController.login);
router.get('/logout', authController.logout);
router.get('/verify', authController.verifyEmail);

module.exports = router;
