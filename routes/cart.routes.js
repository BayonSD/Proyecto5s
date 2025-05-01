// routes/cart.routes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

router.post('/add-to-cart', cartController.addToCart);
router.get('/cart', cartController.viewCart);
router.post('/removeFromCart/:cart_id', cartController.removeFromCart);
router.post('/createOrder', cartController.confirmOrder);

module.exports = router;
