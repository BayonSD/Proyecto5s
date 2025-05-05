// controllers/user.controller.js
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const connection = require('../database/db');
const nodemailer = require('nodemailer');

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'donkomediaa@outlook.com',
        pass: 'katty1968'
    }
});

exports.getAllUsers = (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error("Error al obtener los usuarios:", err);
            res.status(500).send("Error al obtener los usuarios");
        } else {
            res.json(results);
        }
    });
};

exports.getUserById = (req, res) => {
    const userId = req.params.id;
    connection.query('SELECT * FROM users WHERE user_id = ?', [userId], (err, result) => {
        if (err) {
            console.error("Error al obtener el usuario:", err);
            res.status(500).send("Error al obtener el usuario");
        } else {
            res.json(result[0]);
        }
    });
};

exports.registerUser = async (req, res) => {
    const { rut_user, dv_user, user, name, correo, user_type_id, password } = req.body;

    if (!rut_user || !dv_user || !user || !name || !correo || !password || !user_type_id) {
        return res.status(400).send("Todos los campos son requeridos");
    }

    try {
        const passwordHash = await bcryptjs.hash(password, 8);
        const verificationToken = crypto.randomBytes(20).toString('hex');

        connection.query('INSERT INTO users SET ?', {
            rut_user,
            dv_user,
            user,
            name,
            correo,
            user_type_id,
            password: passwordHash,
            verification_token: verificationToken
        }, (err) => {
            if (err) {
                console.error("Error al registrar usuario:", err);
                return res.status(500).send("Error al registrar usuario");
            }

            const mailOptions = {
                from: 'donkomediaa@outlook.com',
                to: correo,
                subject: 'Verificación de correo',
                html: `<p>Gracias por registrarte.</p><a href="http://tuapp.com/verify/${verificationToken}">Verificar correo</a>`
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) console.error("Error al enviar correo:", error);
            });

            res.status(201).send("Usuario registrado correctamente");
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error interno del servidor");
    }
};

exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { user, name, correo, rol, password } = req.body;

    if (password) {
        bcryptjs.hash(password, 8, (err, passwordHash) => {
            if (err) return res.status(500).send("Error al encriptar contraseña");

            const query = 'UPDATE users SET user = ?, name = ?, correo = ?, rol = ?, password = ? WHERE user_id = ?';
            connection.query(query, [user, name, correo, rol, passwordHash, userId], (err) => {
                if (err) {
                    console.error("Error al actualizar usuario:", err);
                    res.status(500).send("Error al actualizar usuario");
                } else {
                    res.send({ message: 'Usuario actualizado' });
                }
            });
        });
    } else {
        const query = 'UPDATE users SET user = ?, name = ?, correo = ?, rol = ? WHERE user_id = ?';
        connection.query(query, [user, name, correo, rol, userId], (err) => {
            if (err) {
                console.error("Error al actualizar usuario:", err);
                res.status(500).send("Error al actualizar usuario");
            } else {
                res.send({ message: 'Usuario actualizado' });
            }
        });
    }
};

exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    connection.query('DELETE FROM users WHERE user_id = ?', [userId], (err) => {
        if (err) {
            console.error("Error al eliminar el usuario:", err);
            res.status(500).send("Error al eliminar el usuario");
        } else {
            res.send({ message: 'Usuario eliminado' });
        }
    });
};
