// controllers/perfil.controller.js
const connection = require('../database/db');

exports.getPerfil = (req, res) => {
    const user_id = req.session.user_id;
    if (!req.session.loggedin || !user_id) {
        return res.redirect('/login');
    }

    const userQuery = 'SELECT * FROM users WHERE user_id = ?';
    const orderQuery = `
        SELECT o.order_id, o.total, o.estado, p.nombre_producto, o.direccion_envio, o.payment_method
        FROM orders o
        JOIN products p ON o.product_id = p.product_id
        WHERE o.user_id = ? AND o.estado = 'COMPLETADO'
        ORDER BY o.order_id DESC`;

    connection.query(userQuery, [user_id], (errUser, userData) => {
        if (errUser || userData.length === 0) {
            return res.status(500).send("Error al obtener datos del usuario");
        }

        connection.query(orderQuery, [user_id], (errOrders, orders) => {
            if (errOrders) {
                return res.status(500).send("Error al obtener historial de compras");
            }

            res.render('perfil', {
                login: true,
                name: req.session.name,
                user: userData[0],
                orders
            });
        });
    });
};
