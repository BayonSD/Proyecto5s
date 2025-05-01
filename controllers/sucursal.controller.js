// controllers/sucursal.controller.js
const connection = require('../database/db');

exports.getAll = (req, res) => {
    const query = 'SELECT * FROM sucursal';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send("Error al obtener las sucursales");

        res.render('sucursales', {
            login: req.session.loggedin || false,
            name: req.session.name || '',
            sucursales: results
        });
    });
};

exports.getAllAPI = (req, res) => {
    connection.query('SELECT * FROM sucursal', (err, result) => {
        if (err) return res.status(500).send("Error al obtener sucursales");
        res.json(result);
    });
};

exports.getById = (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM sucursal WHERE id_sucursal = ?';

    connection.query(query, [id], (err, result) => {
        if (err) return res.status(500).send("Error al obtener la sucursal");
        if (result.length === 0) return res.status(404).send("Sucursal no encontrada");

        res.render('sucursal', {
            login: req.session.loggedin || false,
            name: req.session.name || '',
            sucursal: result[0]
        });
    });
};

exports.getByIdAPI = (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM sucursal WHERE id_sucursal = ?', [id], (err, result) => {
        if (err) return res.status(500).send("Error");
        res.json(result[0]);
    });
};

exports.create = (req, res) => {
    const { nombre_sucursal, direccion_sucursal } = req.body;
    if (!nombre_sucursal || !direccion_sucursal) {
        return res.status(400).send("Faltan campos obligatorios");
    }

    const query = 'INSERT INTO sucursal (nombre_sucursal, direccion_sucursal) VALUES (?, ?)';
    connection.query(query, [nombre_sucursal, direccion_sucursal], (err) => {
        if (err) return res.status(500).send("Error al insertar sucursal");
        res.status(201).send("Sucursal agregada correctamente");
    });
};

exports.update = (req, res) => {
    const id = req.params.id;
    const { nombre_sucursal, direccion_sucursal } = req.body;

    const updates = {};
    if (nombre_sucursal) updates.nombre_sucursal = nombre_sucursal;
    if (direccion_sucursal) updates.direccion_sucursal = direccion_sucursal;

    if (Object.keys(updates).length === 0) {
        return res.status(400).send("Nada para actualizar");
    }

    connection.query('UPDATE sucursal SET ? WHERE id_sucursal = ?', [updates, id], (err) => {
        if (err) return res.status(500).send("Error al actualizar");
        res.redirect('/sucursales');
    });
};

exports.updateAPI = (req, res) => {
    const id = req.params.id;
    const { nombre_sucursal, direccion_sucursal } = req.body;

    const updates = {};
    if (nombre_sucursal) updates.nombre_sucursal = nombre_sucursal;
    if (direccion_sucursal) updates.direccion_sucursal = direccion_sucursal;

    if (Object.keys(updates).length === 0) {
        return res.status(400).send("Nada para actualizar");
    }

    connection.query('UPDATE sucursal SET ? WHERE id_sucursal = ?', [updates, id], (err) => {
        if (err) return res.status(500).send("Error al actualizar");
        res.send("Sucursal actualizada correctamente");
    });
};

exports.delete = (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM sucursal WHERE id_sucursal = ?', [id], (err) => {
        if (err) return res.status(500).send("Error al eliminar");
        res.redirect('/sucursales');
    });
};
