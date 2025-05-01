const mysql = require('mysql2'); // cambia aquí

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 3306 // asegúrate que el puerto esté correcto si lo necesitas
});

connection.connect((error) => {
    if (error) {
        console.log('El error de conexión es: ' + error);
        return;
    }

    console.log('Conectado a la base de datos');
});

module.exports = connection;
