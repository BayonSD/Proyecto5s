// controllers/tarjeta.controller.js
const connection = require('../database/db');

exports.getTarjetasByUser = (req, res) => {
    const user_id = req.params.user_id;

    connection.query('SELECT * FROM tarjeta WHERE user_id = ?', [user_id], (err, results) => {
        if (err) {
            console.error("Error al obtener tarjetas:", err);
            return res.status(500).send("Error al obtener tarjetas");
        }
        res.json(results);
    });
};

exports.addTarjeta = (req, res) => {
    const { user_id, numero_tarjeta, nombre_titular, vencimiento, cvv } = req.body;

    if (!user_id || !numero_tarjeta || !nombre_titular || !vencimiento || !cvv) {
        return res.status(400).send("Todos los campos son requeridos");
    }

    const checkQuery = 'SELECT * FROM tarjeta WHERE numero_tarjeta = ? AND user_id = ?';
    connection.query(checkQuery, [numero_tarjeta, user_id], (err, results) => {
        if (err) return res.status(500).send("Error al verificar tarjeta");

        if (results.length > 0) {
            return res.status(409).send("La tarjeta ya está registrada para este usuario");
        }

        const insertQuery = `
            INSERT INTO tarjeta (user_id, numero_tarjeta, nombre_titular, vencimiento, cvv)
            VALUES (?, ?, ?, ?, ?)`;

        connection.query(insertQuery, [user_id, numero_tarjeta, nombre_titular, vencimiento, cvv], (err) => {
            if (err) return res.status(500).send("Error al guardar tarjeta");
            res.status(201).send("Tarjeta registrada correctamente");
        });
    });
};
