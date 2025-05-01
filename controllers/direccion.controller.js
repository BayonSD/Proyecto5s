// controllers/direccion.controller.js
const connection = require('../database/db');

exports.getDireccionesByUser = (req, res) => {
    const user_id = req.params.user_id;

    const query = 'SELECT * FROM direccion WHERE user_id = ?';
    connection.query(query, [user_id], (err, results) => {
        if (err) {
            console.error("Error al obtener direcciones:", err);
            return res.status(500).send("Error al obtener direcciones");
        }
        res.json(results);
    });
};

exports.addDireccion = (req, res) => {
    const { user_id, direccion, region, comuna } = req.body;

    if (!user_id || !direccion || !region || !comuna) {
        return res.status(400).send("Todos los campos son requeridos");
    }

    const checkQuery = 'SELECT * FROM direccion WHERE user_id = ? AND direccion = ?';
    connection.query(checkQuery, [user_id, direccion], (err, results) => {
        if (err) return res.status(500).send("Error al verificar dirección");

        if (results.length > 0) {
            return res.status(400).send("La dirección ya existe para este usuario");
        }

        const insertQuery = 'INSERT INTO direccion (user_id, direccion, region, comuna) VALUES (?, ?, ?, ?)';
        connection.query(insertQuery, [user_id, direccion, region, comuna], (err) => {
            if (err) return res.status(500).send("Error al insertar dirección");
            res.status(201).send("Dirección agregada correctamente");
        });
    });
};
