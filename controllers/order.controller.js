// controllers/order.controller.js
const connection = require('../database/db');

exports.listOrdersForVendor = (req, res) => {
    const query = `
        SELECT co.order_id, co.user_id, co.product_id, co.quantity, co.total,
               co.estado, co.id_sucursal, co.direccion_envio, p.nombre_producto, s.nombre_sucursal
        FROM cart_orders co
        JOIN products p ON co.product_id = p.product_id
        JOIN sucursal s ON co.id_sucursal = s.id_sucursal`;

    connection.query(query, (err, orders) => {
        if (err) return res.status(500).send("Error al obtener pedidos");
        res.render('vendedor', { cartOrders: orders });
    });
};

exports.updateOrderStatus = (req, res) => {
    const { order_id } = req.params;
    const { estado } = req.body;

    if (!estado || !['ACEPTADO', 'RECHAZADO'].includes(estado)) {
        return res.status(400).send("Estado inválido");
    }

    const getBodegueroQuery = `
        SELECT empleado_id FROM empleados
        WHERE user_type_id = 3 AND id_sucursal = (
            SELECT id_sucursal FROM cart_orders WHERE order_id = ?)`;

    connection.query(getBodegueroQuery, [order_id], (err, bodegueros) => {
        if (err || bodegueros.length === 0) {
            return res.status(404).send("Bodeguero no encontrado");
        }

        const empleado_id = bodegueros[0].empleado_id;

        const updateStatusQuery = 'UPDATE cart_orders SET estado = ? WHERE order_id = ?';
        connection.query(updateStatusQuery, [estado, order_id], (err) => {
            if (err) return res.status(500).send("Error al actualizar estado");

            if (estado === 'ACEPTADO') {
                transferOrderToMain(order_id, empleado_id, res);
            } else {
                res.redirect('/vendedor');
            }
        });
    });
};

function transferOrderToMain(order_id, empleado_id, res) {
    const insertOrderQuery = `
        INSERT INTO orders (user_id, product_id, payment_method, delivery_option, direccion_envio,
                            estado, empleado_id, id_sucursal, total)
        SELECT user_id, product_id, 'EFECTIVO', 'Retiro sucursal', direccion_envio,
               'PENDIENTE', ?, id_sucursal, total
        FROM cart_orders WHERE order_id = ?`;

    connection.query(insertOrderQuery, [empleado_id, order_id], (err) => {
        if (err) return res.status(500).send("Error al transferir pedido");

        connection.query('SELECT total, id_sucursal FROM cart_orders WHERE order_id = ?', [order_id], (err, result) => {
            if (err || result.length === 0) return res.status(500).send("Error al obtener total");

            const { total, id_sucursal } = result[0];

            const updateSucursalQuery = `UPDATE sucursal SET ganancias = ganancias + ? WHERE id_sucursal = ?`;
            connection.query(updateSucursalQuery, [total, id_sucursal], (err) => {
                if (err) return res.status(500).send("Error al actualizar ganancia");

                const date = new Date();
                const mes = date.toLocaleString('default', { month: 'long' });
                const año = date.getFullYear();

                const upsertGanancias = `
                    INSERT INTO sucursal_ganancias (id_sucursal, mes, año, ganancia_mensual, ganancia_anual)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        ganancia_mensual = ganancia_mensual + VALUES(ganancia_mensual),
                        ganancia_anual = ganancia_anual + VALUES(ganancia_mensual)`;

                connection.query(upsertGanancias, [id_sucursal, mes, año, total, total], (err) => {
                    if (err) return res.status(500).send("Error en ganancias mensuales");

                    connection.query('DELETE FROM cart_orders WHERE order_id = ?', [order_id], (err) => {
                        if (err) return res.status(500).send("Error al eliminar de cart_orders");
                        res.redirect('/vendedor');
                    });
                });
            });
        });
    });
}

exports.getPedidosBodeguero = (req, res) => {
    const { empleado_id } = req.params;

    const query = `
        SELECT o.order_id, o.user_id, o.product_id, o.payment_method, o.delivery_option,
               o.direccion_envio, o.estado, o.id_sucursal, o.total, 
               p.nombre_producto, u.name as nombre_usuario, s.nombre_sucursal
        FROM orders o
        JOIN products p ON o.product_id = p.product_id
        JOIN users u ON o.user_id = u.user_id
        JOIN sucursal s ON o.id_sucursal = s.id_sucursal
        WHERE o.empleado_id = ? AND o.estado != 'COMPLETADO'`;

    connection.query(query, [empleado_id], (err, rows) => {
        if (err) return res.status(500).send("Error al obtener pedidos del bodeguero");
        res.render('bodeguero', { pedidos: rows, empleado_id });
    });
};

exports.marcarPedidoCompletado = (req, res) => {
    const { order_id } = req.params;
    const { estado, empleado_id } = req.body;

    if (estado !== 'COMPLETADO') {
        return res.status(400).send("Solo se permite estado COMPLETADO");
    }

    const query = `
        UPDATE orders SET estado = 'COMPLETADO' 
        WHERE order_id = ? AND estado != 'COMPLETADO'`;

    connection.query(query, [order_id], (err) => {
        if (err) return res.status(500).send("Error al actualizar pedido");
        res.redirect(`/bodeguero/${empleado_id}`);
    });
};
