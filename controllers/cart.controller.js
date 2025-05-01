// controllers/cart.controller.js
const connection = require('../database/db');

exports.addToCart = (req, res) => {
    const { user_id, product_id, quantity, id_sucursal, direccion_envio } = req.body;

    if (!user_id || !product_id || !quantity || !id_sucursal) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    connection.query('SELECT precio FROM products WHERE product_id = ?', [product_id], (err, results) => {
        if (err) return res.status(500).send("Error al obtener precio del producto");
        if (results.length === 0) return res.status(404).send("Producto no encontrado");

        const precio = results[0].precio;
        const total = precio * quantity;

        const insertQuery = `
            INSERT INTO carrito_items (user_id, product_id, quantity, id_sucursal, direccion_envio, total)
            VALUES (?, ?, ?, ?, ?, ?)`;

        connection.query(insertQuery, [user_id, product_id, quantity, id_sucursal, direccion_envio, total], (err, result) => {
            if (err) return res.status(500).send("Error al insertar en carrito");

            req.session.cart_id = result.insertId;
            res.status(200).json({ message: 'Producto agregado al carrito', cart_id: result.insertId });
        });
    });
};

exports.viewCart = (req, res) => {
    if (!req.session.loggedin || !req.session.user_id) {
        return res.status(401).send('Acceso no autorizado');
    }

    const user_id = req.session.user_id;
    const cart_id = req.session.cart_id;

    const queryCart = `
        SELECT c.cart_id, p.product_id, p.nombre_producto, p.precio, c.quantity, c.id_sucursal, c.direccion_envio, c.total
        FROM carrito_items c 
        JOIN products p ON c.product_id = p.product_id 
        WHERE c.user_id = ?`;

    connection.query(queryCart, [user_id], (err, items) => {
        if (err) return res.status(500).send("Error al obtener carrito");

        connection.query('SELECT * FROM sucursal', (err, sucursales) => {
            if (err) return res.status(500).send("Error al obtener sucursales");

            res.render('cart', {
                cartItems: items,
                sucursales,
                cart_id: cart_id
            });
        });
    });
};

exports.removeFromCart = (req, res) => {
    const { cart_id } = req.params;

    connection.query('DELETE FROM carrito_items WHERE cart_id = ?', [cart_id], (err) => {
        if (err) return res.status(500).send("Error al eliminar producto del carrito");
        res.redirect('/cart');
    });
};

exports.confirmOrder = (req, res) => {
    let { cart_id } = req.body;
    if (!cart_id && req.session.cart_id) cart_id = req.session.cart_id;
    if (!cart_id) return res.status(400).send("Falta cart_id");

    const insertOrderQuery = `
        INSERT INTO cart_orders (cart_id, user_id, product_id, quantity, id_sucursal, direccion_envio, total, estado)
        SELECT ci.cart_id, ci.user_id, ci.product_id, ci.quantity, ci.id_sucursal, ci.direccion_envio, 
               SUM(p.precio * ci.quantity), 'PENDIENTE'
        FROM carrito_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = ?
        GROUP BY ci.cart_id, ci.user_id, ci.product_id, ci.id_sucursal, ci.direccion_envio`;

    const deleteCartItemsQuery = 'DELETE FROM carrito_items WHERE cart_id = ?';

    connection.beginTransaction(err => {
        if (err) return res.status(500).send("Error al iniciar transacción");

        connection.query(insertOrderQuery, [cart_id], (err) => {
            if (err) return connection.rollback(() => res.status(500).send("Error al insertar orden"));

            connection.query(deleteCartItemsQuery, [cart_id], (err) => {
                if (err) return connection.rollback(() => res.status(500).send("Error al limpiar carrito"));

                connection.commit(err => {
                    if (err) return connection.rollback(() => res.status(500).send("Error al confirmar orden"));
                    res.status(201).send("Orden confirmada correctamente");
                });
            });
        });
    });
};
