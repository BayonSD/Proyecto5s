const connection = require('../database/db');
const bcryptjs = require('bcryptjs');

exports.login = (req, res) => {
    const { user, password } = req.body;

    if (!user || !password) {
        return res.send('Por favor rellene los campos');
    }

    connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, resultsUsers) => {
        if (error) return res.status(500).send("Error al buscar usuario");

        if (resultsUsers.length > 0) {
            const match = await bcryptjs.compare(password, resultsUsers[0].password);
            if (match) {
                req.session.loggedin = true;
                req.session.name = resultsUsers[0].name;
                req.session.user_id = resultsUsers[0].user_id;

                const userType = parseInt(resultsUsers[0].user_type_id);
                if (userType === 1) return res.redirect('/admin');
                if (userType === 2) return res.redirect('/vendedor');
                if (userType === 3) return res.redirect(`/bodeguero/${resultsUsers[0].user_id}`);
                if (userType === 4) return res.redirect('/contador');
                return res.redirect('/');
            }
        }

        // Si no es usuario, intenta con empleados
        connection.query('SELECT * FROM empleados WHERE user = ?', [user], async (error, resultsEmpleados) => {
            if (error) return res.status(500).send("Error al buscar empleado");

            if (resultsEmpleados.length > 0) {
                const match = await bcryptjs.compare(password, resultsEmpleados[0].password);
                if (match) {
                    req.session.loggedin = true;
                    req.session.name = resultsEmpleados[0].name;
                    req.session.empleado_id = resultsEmpleados[0].empleado_id;

                    const userType = parseInt(resultsEmpleados[0].user_type_id);
                    if (userType === 1) return res.redirect('/admin');
                    if (userType === 2) return res.redirect('/vendedor');
                    if (userType === 3) return res.redirect(`/bodeguero/${resultsEmpleados[0].empleado_id}`);
                    if (userType === 4) return res.redirect('/contador');
                    return res.redirect('/');
                }
            }

            res.render('login', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Usuario o contraseña incorrectos",
                alertIcon: 'error',
                ShowConfirmButton: false,
                timer: false,
                ruta: 'login'
            });
        });
    });
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error al cerrar sesión');
        res.redirect('/login');
    });
};

exports.verifyEmail = (req, res) => {
    const token = req.query.token;

    connection.query('SELECT * FROM users WHERE verification_token = ?', [token], (error, results) => {
        if (error || results.length === 0) {
            return res.render('verify', { verified: false });
        }

        connection.query('UPDATE users SET email_verified = ? WHERE verification_token = ?', [true, token], (error) => {
            if (error) return res.render('verify', { verified: false });
            res.render('verify', { verified: true });
        });
    });
};
