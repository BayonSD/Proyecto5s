// scripts/hashPasswords.js
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'employees'
});

connection.connect(async (err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos');

  // Actualizar tabla USERS
  connection.query('SELECT user_id, password FROM users', async (err, users) => {
    if (err) throw err;

    for (let user of users) {
      const hashed = await bcrypt.hash(user.password, 8);
      connection.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, user.user_id]);
    }
    console.log('Contraseñas de USERS actualizadas');
  });

  // Actualizar tabla EMPLEADOS
  connection.query('SELECT empleado_id, password FROM empleados', async (err, empleados) => {
    if (err) throw err;

    for (let emp of empleados) {
      const hashed = await bcrypt.hash(emp.password, 8);
      connection.query('UPDATE empleados SET password = ? WHERE empleado_id = ?', [hashed, emp.empleado_id]);
    }
    console.log('Contraseñas de EMPLEADOS actualizadas');
  });
});
