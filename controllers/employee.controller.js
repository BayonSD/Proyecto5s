// controllers/employee.controller.js
const connection = require('../database/db');

exports.listEmployees = (req, res) => {
    const employeeQuery = 'SELECT * FROM employee';
    const userTypesQuery = 'SELECT * FROM user_types';

    connection.query(employeeQuery, (errEmp, employees) => {
        if (errEmp) return res.status(500).send("Error al obtener empleados");

        connection.query(userTypesQuery, (errTypes, userTypes) => {
            if (errTypes) return res.status(500).send("Error al obtener tipos de usuario");

            res.render('employee_list', {
                login: true,
                name: req.session.name,
                user_id: req.session.user_id,
                employees,
                userTypes
            });
        });
    });
};

exports.createEmployee = (req, res) => {
    const { name, lastname, age, country, job, experience, rut, user_type_id } = req.body;

    if (!name || !lastname || !age || !country || !job || !experience || !rut || !user_type_id) {
        return res.status(400).send("Todos los campos son requeridos");
    }

    const query = `INSERT INTO employee SET ?`;
    const data = { name, lastname, age, country, job, experience, rut, user_type_id };

    connection.query(query, data, (err) => {
        if (err) return res.status(500).send("Error al crear empleado");
        res.redirect('/employee_list');
    });
};

exports.updateEmployee = (req, res) => {
    const { id } = req.params;
    const { name, lastname, age, country, job, experience, rut, user_type_id } = req.body;

    if (!name || !lastname || !age || !country || !job || !experience || !rut || !user_type_id) {
        return res.status(400).send("Todos los campos son requeridos");
    }

    const updateData = { name, lastname, age, country, job, experience, rut, user_type_id };

    connection.query('UPDATE employee SET ? WHERE id = ?', [updateData, id], (err) => {
        if (err) return res.status(500).send("Error al actualizar empleado");
        res.redirect('/employee_list');
    });
};

exports.deleteEmployee = (req, res) => {
    const { id } = req.params;

    connection.query('DELETE FROM employee WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send("Error al eliminar empleado");
        res.redirect('/employee_list');
    });
};
