// routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

router.get('/vendedor', orderController.listOrdersForVendor);
router.post('/updateOrderStatus/:order_id', orderController.updateOrderStatus);
router.get('/bodeguero/:empleado_id', orderController.getPedidosBodeguero);
router.post('/bodeguero/updatePedido/:order_id', orderController.marcarPedidoCompletado);

module.exports = router;
