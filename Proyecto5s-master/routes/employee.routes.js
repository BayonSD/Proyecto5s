// routes/employee.routes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

router.get('/employee_list', employeeController.listEmployees);
router.post('/employee', employeeController.createEmployee);
router.put('/employee/:id', employeeController.updateEmployee);
router.delete('/employee/:id', employeeController.deleteEmployee);

module.exports = router;
