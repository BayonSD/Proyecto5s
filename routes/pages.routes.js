// routes/pages.routes.js
const express = require('express');
const router = express.Router();
const { renderView } = require('../controllers/pages.controller');

router.get('/', renderView('index'));
router.get('/login', renderView('login'));
router.get('/products', renderView('products'));
router.get('/register', renderView('register'));
router.get('/employee_list', renderView('employee_list'));
router.get('/sucursales', renderView('sucursales'));
router.get('/perfil', renderView('perfil'));
router.get('/vendedor', renderView('vendedor'));
router.get('/bodeguero/:empleado_id', renderView('bodeguero'));
router.get('/cart', renderView('cart'));
router.get('/verify', renderView('verify'));

// Puedes agregar más según tus vistas
router.get('/admin', renderView('admin'));
router.get('/users', renderView('users'));
router.get('/users_type', renderView('users_type'));
router.get('/profile', renderView('profile'));
router.get('/external', renderView('external'));
router.get('/addexterno', renderView('addexterno'));
router.get('/productos_detalle', renderView('productos_detalle'));
router.get('/historial_compras', renderView('historial_compras'));
router.get('/orders', renderView('orders'));
router.get('/contador', renderView('contador'));

module.exports = router;
