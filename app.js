// Invocamos Express
const express = require('express');
const app = express();


// Set urlencoded para capturar datos
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

// Directorio público
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

// Motor de plantillas
app.set('view engine', 'ejs');

// bcryptjs
const bcryptjs = require('bcryptjs');

// Variables de sesión
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Invocamos módulo de conexión
const connection = require('./database/db');
const { name } = require('ejs');

// NodeMailer
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'donkomediaa@outlook.com',
        pass: 'katty1968'
    }
});

// RUTAS
app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/navbar', (req, res) => {
    res.render('navbar');
});



// Ruta para obtener productos y sucursales
app.get('/products', (req, res) => {
    const productsQuery = 'SELECT * FROM products';
    const sucursalesQuery = 'SELECT * FROM sucursal'; // Ajusta según tu estructura de tabla de sucursales

    connection.query(productsQuery, (errProducts, productsResult) => {
        if (errProducts) {
            console.error("Error al obtener los productos:", errProducts);
            res.status(500).send("Hubo un error al obtener los productos");
            return;
        }

        connection.query(sucursalesQuery, (errSucursales, sucursalesResult) => {
            if (errSucursales) {
                console.error("Error al obtener las sucursales:", errSucursales);
                res.status(500).send("Hubo un error al obtener las sucursales");
                return;
            }

            res.render('products', {
                login: true,
                name: req.session.name,
                products: productsResult,
                user_id: req.session.user_id,
                sucursales: sucursalesResult // Pasar las sucursales obtenidas a la vista
            });
        });
    });
});



// Ruta para obtener productos en formato JSON
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';
    connection.query(query, (err, result) => {
        if (err) {
            console.error("Error al obtener los productos:", err);
            res.status(500).send("Hubo un error al obtener los productos");
        } else {
            res.json(result);
        }
    });
});

// Ruta para obtener un producto por ID
app.get('/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM products WHERE product_id = ?';
    connection.query(query, [productId], (err, result) => {
        if (err) {
            console.error("Error al obtener el producto:", err);
            res.status(500).send("Error al obtener el producto");
        } else {
            res.json(result[0]);
        }
    });
});

// Ruta para agregar productos desde Postman
app.post('/products', (req, res) => {
    const products = req.body; // Obtener el arreglo de productos del cuerpo de la solicitud
    if (!Array.isArray(products)) {
        return res.status(400).json({ message: 'Se esperaba un arreglo de productos.' });
    }

    const insertQuery = 'INSERT INTO products (nombre_producto, descripcion_producto, stock, precio, imagen) VALUES ?';
    
    // Mapear los productos para insertarlos en la base de datos
    const values = products.map(product => [
        product.nombre_producto,
        product.descripcion_producto,
        product.stock,
        product.precio,
        product.imagen
    ]);

    // Ejecutar la consulta de inserción
    connection.query(insertQuery, [values], (err, result) => {
        if (err) {
            console.error("Error al insertar productos:", err);
            res.status(500).json({ message: 'Error al insertar productos.' });
        } else {
            res.status(201).json({ message: 'Productos agregados correctamente.' });
        }
    });
});

// Ruta para actualizar un producto
app.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    const { nombre_producto, descripcion_producto, stock, precio, imagen} = req.body;
    const query = 'UPDATE products SET nombre_producto = ?, descripcion_producto = ?, stock = ?, precio = ?, imagen = ? WHERE product_id = ?';
    connection.query(query, [nombre_producto, descripcion_producto, precio, stock, imagen,productId], (err, result) => {
        if (err) {
            console.error("Error al actualizar el producto:", err);
            res.status(500).send("Error al actualizar el producto");
        } else {
            res.json({ message: 'Producto actualizado' });
        }
    });
});


// Ruta para eliminar un producto
app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM products WHERE product_id = ?';
    connection.query(query, [productId], (err, result) => {
        if (err) {
            console.error("Error al eliminar el producto:", err);
            res.status(500).send("Error al eliminar el producto");
        } else {
            res.json({ message: 'Producto eliminado' });
        }
    });
});



//Obtener listas de usuarios
app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener el listado de usuarios:", err);
            res.status(500).send("Error al obtener el listado de usuarios");
        } else {
            res.json(results);
        }
    });
});



// Ruta para obtener usuarios en formato JSON
app.get('/api/users', (req, res) => {
    const query = 'SELECT * FROM users';
    connection.query(query, (err, result) => {
        if (err) {
            console.error("Error al obtener los usuarios:", err);
            res.status(500).send("Hubo un error al obtener los usuarios");
        } else {
            res.json(result);
        }
    });
});



// Ruta para obtener y mostrar los tipos de usuarios
app.get('/users_type', (req, res) => {
    const query = 'SELECT * FROM user_types';
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener los tipos de usuarios:", err);
        res.status(500).send("Error al obtener los tipos de usuarios");
      } else {
        res.render('users_type', { userTypes: results });
      }
    });
  });


  
// Ruta para mostrar el formulario de registro
app.get('/register', (req, res) => {
    const query = 'SELECT * FROM user_types';
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener los tipos de usuarios:", err);
        res.status(500).send("Error al obtener los tipos de usuarios");
      } else {
        res.render('register', {
          userTypes: results,
          alert: false,
          alertTitle: "",
          alertMessage: "",
          alertIcon: "",
          ShowConfirmButton: false,
          timer: 0,
          ruta: ""
        });
      }
    });
  });
  
// Ruta para registro de usuario
app.post('/register', async (req, res) => {
    const { rut_user,dv_user,user, name, correo, user_type_id, password } = req.body;
  
    // Validar que todos los campos necesarios estén presentes
    if (!rut_user||!dv_user||!user || !name || !correo || !password || !user_type_id) {
      return res.status(400).send("Todos los campos son requeridos");
    }
  
    try {
      // Verificar que el user_type_id es válido
      connection.query('SELECT id_user_types AS id FROM user_types WHERE id_user_types = ?', [user_type_id], async (err, rows) => {
        if (err) {
          console.error("Error al verificar el tipo de usuario:", err);
          return res.status(500).send("Error al verificar el tipo de usuario");
        }
        
        if (rows.length === 0) {
          return res.status(400).send("Tipo de usuario no válido");
        }
  
        // Generar hash del password con bcryptjs
        const passwordHash = await bcryptjs.hash(password, 8);
  
        // Generar token de verificación
        const verificationToken = crypto.randomBytes(20).toString('hex');
  
        // Insertar usuario en la base de datos
        connection.query('INSERT INTO users SET ?', {
          rut_user,
          dv_user,
          user,
          name,
          correo,
          user_type_id,
          password: passwordHash,
          verification_token: verificationToken
        }, (err, result) => {
          if (err) {
            console.error("Error al insertar usuario:", err);
            return res.status(500).send("Error al procesar registro");
          }
  
          // Enviar correo de verificación
          const mailOptions = {
            from: 'donkomediaa@outlook.com',
            to: correo,
            subject: 'Verificación de correo',
            html: `<p>¡Gracias por registrarte en nuestra plataforma!</p>
                   <p>Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
                   <a href="http://tuapp.com/verify/${verificationToken}">Verificar correo electrónico</a>`
          };
  
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error("Error al enviar correo de verificación:", error);
            } else {
              console.log('Correo enviado con éxito:', info.response);
            }
          });
  
          // Renderizar la vista de registro exitoso con mensaje de éxito
          res.render('register', {
            userTypes: [],
            alert: true,
            alertTitle: "Registro",
            alertMessage: "Registro completo",
            alertIcon: 'success',
            ShowConfirmButton: false,
            timer: 1500,
            ruta: ''
          });
        });
      });
    } catch (error) {
      console.error("Error al procesar registro:", error);
      res.status(500).send("Error al procesar registro");
}});

//Registro multiple de usuarios
app.post('/register/batch', async (req, res) => {
    try {
        const users = req.body; // Obtener el arreglo de usuarios desde el cuerpo de la solicitud

        // Validar que se recibieron datos
        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).send("Se requiere al menos un usuario para el registro");
        }

        // Procesar cada usuario para insertarlo en la base de datos
        const insertPromises = users.map(async (user) => {
            const { rut_user, dv_user, user: username, name, correo, password, user_type_id } = user;

            // Generar hash del password con bcryptjs
            const passwordHash = await bcryptjs.hash(password, 8);

            // Generar token de verificación
            const verificationToken = crypto.randomBytes(20).toString('hex');

            // Insertar usuario en la base de datos
            return new Promise((resolve, reject) => {
                connection.query('INSERT INTO users SET ?', {
                    rut_user,
                    dv_user,
                    user: username,
                    name,
                    correo,
                    password: passwordHash,
                    verification_token: verificationToken,
                    user_type_id
                }, (error, results) => {
                    if (error) {
                        console.error("Error al registrar usuario:", error);
                        reject(error);
                    } else {
                        // Envío de correo de verificación (opcional)
                        const mailOptions = {
                            from: 'donkomediaa@outlook.com',
                            to: correo,
                            subject: 'Verificación de correo',
                            html: `<p>¡Gracias por registrarte en nuestra plataforma!</p>
                                   <p>Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
                                   <a href="http://tuapp.com/verify/${verificationToken}">Verificar correo electrónico</a>`
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.error("Error al enviar correo de verificación:", error);
                            } else {
                                console.log('Correo enviado con éxito:', info.response);
                            }
                        });

                        resolve(results);
                    }
                });
            });
        });

        // Esperar a que se completen todas las inserciones
        await Promise.all(insertPromises);

        // Enviar respuesta al cliente
        res.status(201).send("Registros de usuarios completados correctamente");
    } catch (error) {
        console.error("Error al procesar registros de usuarios:", error);
        res.status(500).send("Error al procesar registros de usuarios");
    }
});

// Ruta para obtener un usuario por ID
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT * FROM users WHERE user_id = ?';
    connection.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error al obtener el usuario:", err);
            res.status(500).send("Error al obtener el usuario");
        } else {
            res.json(result[0]);
        }
    });
});

// Ruta para actualizar un usuario
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { user, name, correo, rol, password } = req.body;
    let updateQuery;
    let updateData;

    if (password) {
        // Si la contraseña está presente, encriptarla y actualizarla junto con los demás campos
        bcryptjs.hash(password, 8, (err, passwordHash) => {
            if (err) {
                console.error("Error al encriptar la contraseña:", err);
                res.status(500).send("Error al encriptar la contraseña");
            } else {
                updateQuery = 'UPDATE users SET user = ?, name = ?, correo = ?, rol = ?, password = ? WHERE user_id = ?';
                updateData = [user, name, correo, rol, passwordHash, userId];
                connection.query(updateQuery, updateData, (err, result) => {
                    if (err) {
                        console.error("Error al actualizar el usuario:", err);
                        res.status(500).send("Error al actualizar el usuario");
                    } else {
                        res.json({ message: 'Usuario actualizado' });
                    }
                });
            }
        });
    } else {
        // Si la contraseña no está presente, actualizar solo los demás campos
        updateQuery = 'UPDATE users SET user = ?, name = ?, correo = ?, rol = ? WHERE user_id = ?';
        updateData = [user, name, correo, rol, userId];
        connection.query(updateQuery, updateData, (err, result) => {
            if (err) {
                console.error("Error al actualizar el usuario:", err);
                res.status(500).send("Error al actualizar el usuario");
            } else {
                res.json({ message: 'Usuario actualizado' });
            }
        });
    }
});

// Ruta para eliminar un usuario
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE user_id = ?';
    connection.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Error al eliminar el usuario:", err);
            res.status(500).send("Error al eliminar el usuario");
        } else {
            res.json({ message: 'Usuario eliminado' });
        }
    });
});


// Obtener direcciones de un usuario
app.get('/direccion/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const query = 'SELECT * FROM direccion WHERE user_id = ?';
    connection.query(query, [user_id], (err, results) => {
        if (err) {
            console.error("Error al obtener direcciones del usuario:", err);
            return res.status(500).send("Error al obtener direcciones del usuario");
        }
        res.json(results); // Devolver las direcciones en formato JSON
    });
});

// Agregar dirección para un usuario
app.post('/direccion', (req, res) => {
    const { user_id, direccion, region, comuna } = req.body;

    const checkQuery = 'SELECT * FROM direccion WHERE user_id = ? AND direccion = ?';
    connection.query(checkQuery, [user_id, direccion], (err, results) => {
        if (err) {
            console.error("Error al verificar dirección existente:", err);
            return res.status(500).send("Error al verificar dirección existente");
        }
        
        if (results.length > 0) {
            return res.status(400).send("La dirección ya existe para este usuario");
        }

        const insertQuery = 'INSERT INTO direccion (user_id, direccion, region, comuna) VALUES (?, ?, ?, ?)';
        connection.query(insertQuery, [user_id, direccion, region, comuna], (err, result) => {
            if (err) {
                console.error("Error al agregar dirección:", err);
                return res.status(500).send("Error al agregar dirección");
            }
            res.status(201).send("Dirección agregada correctamente");
        });
    });
});


// Obtener tarjetas de un usuario
app.get('/tarjeta/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const query = 'SELECT * FROM tarjeta WHERE user_id = ?';
    connection.query(query, [user_id], (err, results) => {
        if (err) {
            console.error("Error al obtener tarjetas del usuario:", err);
            return res.status(500).send("Error al obtener tarjetas del usuario");
        }
        res.json(results); // Devolver las tarjetas en formato JSON
    });
});

// Agregar tarjeta para un usuario
app.post('/tarjeta', (req, res) => {
    const { user_id, titular, tipo_tarjeta, numero_tarjeta, cvv, fecha_vencimiento } = req.body;

    const checkQuery = 'SELECT * FROM tarjeta WHERE user_id = ? AND numero_tarjeta = ?';
    connection.query(checkQuery, [user_id, numero_tarjeta], (err, results) => {
        if (err) {
            console.error("Error al verificar tarjeta existente:", err);
            return res.status(500).send("Error al verificar tarjeta existente");
        }
        
        if (results.length > 0) {
            return res.status(400).send("La tarjeta ya existe para este usuario");
        }

        const insertQuery = 'INSERT INTO tarjeta (user_id, titular, tipo_tarjeta, numero_tarjeta, cvv, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(insertQuery, [user_id, titular, tipo_tarjeta, numero_tarjeta, cvv, fecha_vencimiento], (err, result) => {
            if (err) {
                console.error("Error al agregar tarjeta:", err);
                return res.status(500).send("Error al agregar tarjeta");
            }
            res.status(201).send("Tarjeta agregada correctamente");
        });
    });
});


// Ruta para mostrar la lista de empleados
app.get('/employee_list', (req, res) => {
    const employeeQuery = 'SELECT * FROM employee';
    const userTypesQuery = 'SELECT * FROM user_types';

    // Ejecutar ambas consultas en paralelo
    connection.query(employeeQuery, (errEmployee, employeesResult) => {
        if (errEmployee) {
            console.error("Error al obtener empleados:", errEmployee);
            return res.status(500).send("Hubo un error al obtener los empleados");
        }

        connection.query(userTypesQuery, (errUserTypes, userTypesResult) => {
            if (errUserTypes) {
                console.error("Error al obtener tipos de usuario:", errUserTypes);
                return res.status(500).send("Hubo un error al obtener los tipos de usuario");
            }

            // Renderizar la plantilla con los datos obtenidos
            res.render('employee_list', {
                login: true, // Ejemplo de variable de sesión para login
                name: req.session.name, // Ejemplo de nombre de usuario desde sesión
                employees: employeesResult, // Array de empleados obtenidos de la base de datos
                userTypes: userTypesResult, // Array de tipos de usuario obtenidos de la base de datos
                user_id: req.session.user_id // Ejemplo de ID de usuario desde sesión
            });
        });
    });
});

// Crear un nuevo empleado
app.post('/employee', async (req, res) => {
    const { name, lastname, age, country, job, experience, rut, user_type_id } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!name || !lastname || !age || !country || !job || !experience || !rut || !user_type_id) {
        return res.status(400).send("Todos los campos son requeridos");
    }

    try {
        // Insertar empleado en la base de datos
        await connection.query('INSERT INTO employee SET ?', {
            name,
            lastname,
            age,
            country,
            job,
            experience,
            rut,
            user_type_id
        });

        // Redirigir a la lista de empleados después de crear uno nuevo
        res.redirect('/employee_list');
    } catch (error) {
        console.error("Error al crear empleado:", error);
        res.status(500).send("Error al crear empleado");
    }
});

// Actualizar un empleado por su ID
app.put('/employee/:id', async (req, res) => {
    const employeeId = req.params.id;
    const { name, lastname, age, country, job, experience, rut, user_type_id } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!name || !lastname || !age || !country || !job || !experience || !rut || !user_type_id) {
        return res.status(400).send("Todos los campos son requeridos");
    }

    try {
        // Actualizar empleado en la base de datos
        await connection.query('UPDATE employee SET ? WHERE id = ?', [{
            name,
            lastname,
            age,
            country,
            job,
            experience,
            rut,
            user_type_id
        }, employeeId]);

        // Redirigir a la lista de empleados después de actualizar
        res.redirect('/employee_list');
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        res.status(500).send("Error al actualizar empleado");
    }
});

// Eliminar un empleado por su ID
app.delete('/employee/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        // Eliminar empleado de la base de datos
        await connection.query('DELETE FROM employee WHERE id = ?', [employeeId]);

        // Redirigir a la lista de empleados después de eliminar
        res.redirect('/employee_list');
    } catch (error) {
        console.error("Error al eliminar empleado:", error);
        res.status(500).send("Error al eliminar empleado");
    }
});


// Obtener todas las sucursales
app.get('/sucursales', (req, res) => {
    const query = 'SELECT * FROM sucursal';
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener las sucursales:", err);
            return res.status(500).send("Error al obtener las sucursales");
        } else {
            res.render('sucursales', {
                login: req.session.loggedin || false,
                name: req.session.name || '',
                sucursales: results
            });
        }
    });
});

// Ruta para obtener sucursales en formato JSON
app.get('/api/sucursales', (req, res) => {
    const query = 'SELECT * FROM sucursal';
        connection.query(query, (err, result) => {
        if (err) {
            console.error("Error al obtener las sucursales:", err);
            res.status(500).send("Hubo un error al obtener las sucursales");
        } else {
            res.json(result);
        }
    });
});

// Obtener una sucursal por su ID
app.get('/sucursal/:id_sucursal', (req, res) => {
    const id_sucursal = req.params.id;
    const query = 'SELECT * FROM sucursal WHERE id_sucursal = ?';
    connection.query(query, [id_sucursal], (err, results) => {
        if (err) {
            console.error("Error al obtener la sucursal:", err);
            return res.status(500).send("Error al obtener la sucursal");
        } else {
            if (results.length > 0) {
                res.render('sucursal', { 
                    login: req.session.loggedin || false,
                    name: req.session.name || '',
                    sucursal: results[0] 
                });
            } else {
                res.status(404).send("Sucursal no encontrada");
            }
        }
    });
});

//Obtener sucursal por POSTMAN
app.get('/api/sucursal/:id_sucursal', (req, res) => {
    const sucursalId = req.params.id_sucursal; // Corregido: params.id_sucursal en lugar de params.id
    const query = 'SELECT * FROM sucursal WHERE id_sucursal = ?';
    connection.query(query, [sucursalId], (err, result) => {
        if (err) {
            console.error("Error al obtener sucursal:", err);
            res.status(500).send("Error al obtener la sucursal");
        } else {
            res.json(result[0]);
        }
    });
});


// Crear una nueva sucursal
app.post('/sucursal2', (req, res) => {
    const sucursales = req.body; // Obtener el arreglo de sucursales del cuerpo de la solicitud

    // Validar que se recibieron datos
    if (!sucursales || !Array.isArray(sucursales) || sucursales.length === 0) {
        return res.status(400).send("Se requiere al menos una sucursal para la inserción");
    }

    // Mapear las sucursales para insertarlas en la base de datos
    const values = sucursales.map(sucursal => [
        sucursal.nombre_sucursal,
        sucursal.direccion_sucursal
    ]);

    // Query para inserción masiva
    const insertQuery = 'INSERT INTO sucursal (nombre_sucursal, direccion_sucursal) VALUES ?';

    // Ejecutar la consulta de inserción
    connection.query(insertQuery, [values], (err, result) => {
        if (err) {
            console.error("Error al insertar sucursales:", err);
            res.status(500).send("Error al insertar sucursales");
        } else {
            console.log("Sucursales agregadas correctamente");
            res.status(201).send("Sucursales agregadas correctamente");
        }
    });
});


// Actualizar una sucursal por su ID
app.put('/sucursal/:id', (req, res) => {
    const id_sucursal = req.params.id;
    const { nombre_sucursal, direccion_sucursal } = req.body;

    // Validar que al menos uno de los campos de actualización esté presente
    if (!nombre_sucursal && !direccion_sucursal) {
        return res.status(400).send("Se requiere al menos un campo para actualizar");
    }

    const updates = {};
    if (nombre_sucursal) updates.nombre_sucursal = nombre_sucursal;
    if (direccion_sucursal) updates.direccion_sucursal = direccion_sucursal;

    const query = 'UPDATE sucursal SET ? WHERE id_sucursal = ?';
    connection.query(query, [updates, id_sucursal], (err, result) => {
        if (err) {
            console.error("Error al actualizar la sucursal:", err);
            return res.status(500).send("Error al actualizar la sucursal");
        } else {
            console.log("Sucursal actualizada correctamente");
            res.redirect('/sucursales');
        }
    });
});




// Ruta para actualizar una sucursal por su ID POSTMAN
app.put('/api/sucursal/:id', (req, res) => {
    const id_sucursal = req.params.id;
    const { nombre_sucursal, direccion_sucursal } = req.body;

    // Validar que al menos uno de los campos de actualización esté presente
    if (!nombre_sucursal && !direccion_sucursal) {
        return res.status(400).send("Se requiere al menos un campo para actualizar");
    }

    const updates = {};
    if (nombre_sucursal) updates.nombre_sucursal = nombre_sucursal;
    if (direccion_sucursal) updates.direccion_sucursal = direccion_sucursal;

    const query = 'UPDATE sucursal SET ? WHERE id_sucursal = ?';
    connection.query(query, [updates, id_sucursal], (err, result) => {
        if (err) {
            console.error("Error al actualizar la sucursal:", err);
            return res.status(500).send("Error al actualizar la sucursal");
        } else {
            console.log("Sucursal actualizada correctamente");
            res.status(200).send("Sucursal actualizada correctamente");
        }
    });
});




// Eliminar una sucursal por su ID
app.delete('/sucursal/:id', (req, res) => {
    const id_sucursal = req.params.id;
    const query = 'DELETE FROM sucursal WHERE id_sucursal = ?';
    connection.query(query, [id_sucursal], (err, result) => {
        if (err) {
            console.error("Error al eliminar la sucursal:", err);
            return res.status(500).send("Error al eliminar la sucursal");
        } else {
            console.log("Sucursal eliminada correctamente");
            res.redirect('/sucursales');
        }
    });
});


// Verificación de correo
app.get('/verify', (req, res) => {
    const token = req.query.token;

    connection.query('SELECT * FROM users WHERE verification_token = ?', [token], (error, results) => {
        if (error || results.length === 0) {
            res.render('verify', { verified: false });
        } else {
            connection.query('UPDATE users SET email_verified = ? WHERE verification_token = ?', [true, token], (error) => {
                if (error) {
                    console.log('Error al verificar correo electrónico:', error);
                    res.render('verify', { verified: false });
                } else {
                    res.render('verify', { verified: true });
                }
            });
        }
    });
});

// Autenticación
// Autenticación
app.post('/auth', (req, res) => {
    const { user, password } = req.body;
    if (user && password) {
        // Buscar en la tabla 'users' si el usuario es un cliente
        connection.query('SELECT * FROM users WHERE user = ? AND password = ?', [user, password], (error, resultsUsers) => {
            if (resultsUsers.length > 0) {
                // Usuario encontrado en la tabla 'users' (cliente)
                req.session.loggedin = true;
                req.session.name = resultsUsers[0].name;
                req.session.user_id = resultsUsers[0].user_id;

                // Redirigir según el tipo de usuario
                const userType = resultsUsers[0].user_type_id;
                if (userType === 1) { // Administrador
                    res.redirect('/admin');
                } else if (userType === 2) { // Vendedor/Encargado
                    res.redirect('/vendedor');
                } else if (userType === 3) { // Bodeguero
                    res.redirect(`/bodeguero/${resultsUsers[0].user_id}`);
                } else if (userType === 4) { // Contador
                    res.redirect('/contador');
                } else {
                    res.redirect('/'); // Clientes o cualquier otro tipo de usuario
                }
            } else {
                // Si no es cliente, buscar en la tabla 'empleados'
                connection.query('SELECT * FROM empleados WHERE user = ? AND password = ?', [user, password], (error, resultsEmpleados) => {
                    if (resultsEmpleados.length > 0) {
                        // Usuario encontrado en la tabla 'empleados' (empleado)
                        req.session.loggedin = true;
                        req.session.name = resultsEmpleados[0].name;
                        req.session.empleado_id = resultsEmpleados[0].empleado_id;

                        // Redirigir según el tipo de usuario
                        const userType = resultsEmpleados[0].user_type_id;
                        if (userType === 1) { // Administrador
                            res.redirect('/admin');
                        } else if (userType === 2) { // Vendedor/Encargado
                            res.redirect('/vendedor');
                        } else if (userType === 3) { // Bodeguero
                            res.redirect(`/bodeguero/${resultsEmpleados[0].empleado_id}`);
                        } else if (userType === 4) { // Contador
                            res.redirect('/contador');
                        } else {
                            res.redirect('/'); // Clientes o cualquier otro tipo de usuario
                        }
                    } else {
                        // Usuario no encontrado en ninguna tabla
                        res.render('login', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "Usuario o contraseña incorrectos",
                            alertIcon: 'error',
                            ShowConfirmButton: false,
                            timer: false,
                            ruta: 'login'
                        });
                    }
                });
            }
        });
    } else {
        res.send('Por favor rellene los campos');
    }
});




// Página principal
app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('index', {
            login: true,
            name: req.session.name
        });
    } else {
        res.render('index', {
            login: false,
            name: 'Debe iniciar sesión'
        });
    }
});

// Ruta para logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error al cerrar sesión');
        } else {
            res.redirect('/login');
        }
    });
});


//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS ////VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 

app.post('/add-to-cart', (req, res) => {
    const { user_id, product_id, quantity, id_sucursal, direccion_envio } = req.body;

    // Validar que los datos necesarios estén presentes
    if (!user_id || !product_id || !quantity || !id_sucursal) {
        return res.status(400).json({ message: 'Por favor, proporcione todos los campos requeridos.' });
    }

    // Calcular el total basado en la cantidad y el precio del producto (asumiendo que los productos están en la tabla 'products')
    connection.query('SELECT precio FROM products WHERE product_id = ?', [product_id], (error, results) => {
        if (error) {
            console.error("Error al obtener el precio del producto:", error);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'El producto no existe.' });
        }

        const precioUnitario = results[0].precio;
        const total = precioUnitario * quantity;

        // Insertar el producto en el carrito de compras
        const insertQuery = 'INSERT INTO carrito_items (user_id, product_id, quantity, id_sucursal, direccion_envio, total) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(insertQuery, [user_id, product_id, quantity, id_sucursal, direccion_envio, total], (err, result) => {
            if (err) {
                console.error("Error al agregar producto al carrito:", err);
                return res.status(500).json({ message: 'Error al agregar producto al carrito.' });
            }

            // Obtener el cart_id insertado
            const cart_id = result.insertId;

            // Guardar cart_id en la sesión del usuario
            req.session.cart_id = cart_id;

            res.status(200).json({ message: 'Producto agregado al carrito correctamente.', cart_id: cart_id });
        });
    });
});


// En tu controlador para la vista de carrito (normalmente en un endpoint GET /cart)
app.get('/cart', (req, res) => {
    if (!req.session.loggedin || !req.session.user_id) {
        return res.status(401).send('Acceso no autorizado');
    }

    const { user_id } = req.session;

    // Consulta para obtener el cart_id desde la base de datos o sesión, según tu implementación
    // Aquí asumiré que lo obtienes de la sesión o base de datos
    const cart_id = req.session.cart_id; // Esto depende de cómo manejes cart_id en tu aplicación

    // Obtener los productos del carrito
    const queryCartItems = `
        SELECT c.cart_id, p.product_id, p.nombre_producto, p.precio, c.quantity, c.id_sucursal, c.direccion_envio, c.total
        FROM carrito_items c 
        JOIN products p ON c.product_id = p.product_id 
        WHERE c.user_id = ?`;

    connection.query(queryCartItems, [user_id], (err, resultsCart) => {
        if (err) {
            console.error("Error al obtener los productos del carrito:", err);
            return res.status(500).send("Error al obtener los productos del carrito");
        }

        // Obtener las sucursales disponibles para retiro en tienda
        const querySucursales = 'SELECT * FROM sucursal';
        connection.query(querySucursales, (err, sucursales) => {
            if (err) {
                console.error("Error al obtener las sucursales:", err);
                return res.status(500).send("Error al obtener las sucursales");
            }

            // Renderizar la vista cart.ejs con los datos necesarios, incluido cart_id
            res.render('cart', {
                cartItems: resultsCart,
                sucursales: sucursales,
                cart_id: cart_id // Asegúrate de pasar cart_id a la vista
            });
        });
    });
});


// Eliminar producto del carrito
app.post('/removeFromCart/:cart_id', (req, res) => {
    const cart_id = req.params.cart_id;

    const deleteQuery = 'DELETE FROM carrito_items WHERE cart_id = ?';

    connection.query(deleteQuery, [cart_id], (err, result) => {
        if (err) {
            console.error("Error al eliminar producto del carrito:", err);
            return res.status(500).send("Error al eliminar producto del carrito");
        }

        console.log("Producto eliminado del carrito correctamente");
        res.redirect('/cart'); // Redireccionar de nuevo al carrito después de eliminar
    });
});


app.post('/createOrder', (req, res) => {
    const { cart_id } = req.body;

    // Verificar si cart_id está presente en req.body, de lo contrario, intentar obtenerlo de la sesión
    if (!cart_id && req.session.cart_id) {
        cart_id = req.session.cart_id;
    }

    if (!cart_id) {
        return res.status(400).send("Se requiere el cart_id para confirmar la orden");
    }

    // Consulta para obtener los datos del carrito
    const getCartItemsQuery = `
        SELECT ci.user_id, ci.product_id, ci.quantity, ci.id_sucursal, ci.direccion_envio, p.precio
        FROM carrito_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = ?`;

    // Consulta para insertar en cart_orders
    const insertOrderQuery = `
        INSERT INTO cart_orders (cart_id, user_id, product_id, quantity, id_sucursal, direccion_envio, total, estado)
        SELECT ci.cart_id, ci.user_id, ci.product_id, ci.quantity, ci.id_sucursal, ci.direccion_envio, SUM(p.precio * ci.quantity), 'PENDIENTE'
        FROM carrito_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = ?
        GROUP BY ci.cart_id, ci.user_id, ci.product_id, ci.id_sucursal, ci.direccion_envio`;

    // Consulta para eliminar items del carrito después de confirmar la orden
    const deleteCartItemsQuery = `
        DELETE FROM carrito_items
        WHERE cart_id = ?`;

    connection.beginTransaction(err => {
        if (err) {
            console.error("Error al iniciar la transacción:", err);
            return res.status(500).send("Error al confirmar la orden");
        }

        // Obtener los datos del carrito
        connection.query(getCartItemsQuery, [cart_id], (err, cartItems) => {
            if (err) {
                connection.rollback(() => {
                    console.error("Error al obtener datos del carrito:", err);
                    res.status(500).send("Error al confirmar la orden");
                });
                return;
            }

            if (cartItems.length === 0) {
                connection.rollback(() => {
                    console.error("No se encontraron productos en el carrito con el cart_id proporcionado");
                    res.status(404).send("No se encontraron productos en el carrito con el cart_id proporcionado");
                });
                return;
            }

            // Insertar la orden en cart_orders
            connection.query(insertOrderQuery, [cart_id], (err, result) => {
                if (err) {
                    connection.rollback(() => {
                        console.error("Error al insertar orden en cart_orders:", err);
                        res.status(500).send("Error al confirmar la orden");
                    });
                    return;
                }

                // Eliminar items del carrito_items
                connection.query(deleteCartItemsQuery, [cart_id], (err, result) => {
                    if (err) {
                        connection.rollback(() => {
                            console.error("Error al borrar datos de carrito_items:", err);
                            res.status(500).send("Error al confirmar la orden");
                        });
                        return;
                    }

                    connection.commit(err => {
                        if (err) {
                            connection.rollback(() => {
                                console.error("Error al confirmar la transacción:", err);
                                res.status(500).send("Error al confirmar la orden");
                            });
                            return;
                        }

                        console.log("Orden confirmada correctamente");
                        res.status(201).send("Orden confirmada correctamente");
                    });
                });
            });
        });
    });
});

// Mostrar lista de pedidos desde cart_orders
app.get('/vendedor', (req, res) => {
    // Consulta para obtener todos los pedidos de cart_orders
    const queryCartOrders = `
        SELECT co.order_id, co.user_id, co.product_id, co.quantity, co.total,
               co.estado, co.id_sucursal, co.direccion_envio, p.nombre_producto, s.nombre_sucursal
        FROM cart_orders co
        JOIN products p ON co.product_id = p.product_id
        JOIN sucursal s ON co.id_sucursal = s.id_sucursal`;

    // Ejecutar la consulta
    connection.query(queryCartOrders, (err, cartOrders) => {
        if (err) {
            console.error("Error al obtener los pedidos desde cart_orders:", err);
            return res.status(500).send("Error al obtener los pedidos");
        }

        // Renderizar la vista de pedidos para vendedor/encargado con datos de pedidos
        res.render('vendedor', { cartOrders });
    });
});

//Cambiar ESTADO del pedido y envio de datos
app.post('/updateOrderStatus/:order_id', (req, res) => {
    const { order_id } = req.params;
    const { estado } = req.body;

    if (!order_id || !estado) {
        return res.status(400).send("Se requiere el order_id y estado para actualizar el pedido");
    }

    if (estado !== 'ACEPTADO' && estado !== 'RECHAZADO') {
        return res.status(400).send("El estado debe ser 'ACEPTADO' o 'RECHAZADO'");
    }

    // Consulta para obtener el empleado bodeguero de la sucursal
    const getBodegueroQuery = `
        SELECT empleado_id
        FROM empleados
        WHERE user_type_id = 3 AND id_sucursal = (
            SELECT id_sucursal
            FROM cart_orders
            WHERE order_id = ?
        )`;

    // Ejecutar la consulta para obtener el empleado bodeguero
    connection.query(getBodegueroQuery, [order_id], (err, rows) => {
        if (err) {
            console.error("Error al obtener el bodeguero:", err);
            return res.status(500).send("Error al obtener el bodeguero");
        }

        if (rows.length === 0) {
            console.error("No se encontró ningún bodeguero para la sucursal especificada.");
            return res.status(404).send("No se encontró ningún bodeguero para la sucursal especificada.");
        }

        const empleado_id = rows[0].empleado_id;

        // Actualizar estado del pedido en cart_orders
        const updateStatusQuery = `
            UPDATE cart_orders
            SET estado = ?
            WHERE order_id = ?`;

        connection.query(updateStatusQuery, [estado, order_id], (err, result) => {
            if (err) {
                console.error("Error al actualizar estado del pedido en cart_orders:", err);
                return res.status(500).send("Error al actualizar estado del pedido en cart_orders");
            }

            console.log(`Estado del pedido ${order_id} actualizado correctamente a ${estado}`);

            if (estado === 'ACEPTADO') {
                // Transferir pedido a la tabla orders
                const transferToOrdersQuery = `
                    INSERT INTO orders (user_id, product_id, payment_method, delivery_option, direccion_envio, estado, empleado_id, id_sucursal, total)
                    SELECT user_id, product_id, 'EFECTIVO', 'Retiro sucursal', direccion_envio, 'PENDIENTE', ?, id_sucursal, total
                    FROM cart_orders
                    WHERE order_id = ?`;

                connection.query(transferToOrdersQuery, [empleado_id, order_id], (err, result) => {
                    if (err) {
                        console.error("Error al transferir pedido a orders:", err);
                        return res.status(500).send("Error al transferir pedido a orders");
                    }

                    console.log(`Pedido ${order_id} transferido a orders correctamente`);

                    // Obtener el total del pedido de la tabla cart_orders
                    const getTotalQuery = `
                        SELECT total, id_sucursal
                        FROM cart_orders
                        WHERE order_id = ?`;

                    connection.query(getTotalQuery, [order_id], (err, result) => {
                        if (err) {
                            console.error("Error al obtener el total del pedido de cart_orders:", err);
                            return res.status(500).send("Error al obtener el total del pedido de cart_orders");
                        }

                        const { total, id_sucursal } = result[0];

                        // Actualizar la ganancia en la tabla sucursal
                        const updateSucursalGananciaQuery = `
                            UPDATE sucursal
                            SET ganancias = ganancias + ?
                            WHERE id_sucursal = ?`;

                        connection.query(updateSucursalGananciaQuery, [total, id_sucursal], (err, result) => {
                            if (err) {
                                console.error("Error al actualizar la ganancia en la tabla sucursal:", err);
                                return res.status(500).send("Error al actualizar la ganancia en la tabla sucursal");
                            }

                            console.log(`Ganancia actualizada correctamente en la sucursal ${id_sucursal}`);

                            // Actualizar o insertar ganancia en la tabla sucursal_ganancias
                            const currentDate = new Date();
                            const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
                            const currentYear = currentDate.getFullYear();

                            const upsertSucursalGananciaQuery = `
                                INSERT INTO sucursal_ganancias (id_sucursal, mes, año, ganancia_mensual, ganancia_anual)
                                VALUES (?, ?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE
                                ganancia_mensual = ganancia_mensual + VALUES(ganancia_mensual),
                                ganancia_anual = ganancia_anual + VALUES(ganancia_mensual)`;

                            connection.query(upsertSucursalGananciaQuery, [id_sucursal, currentMonth, currentYear, total, total], (err, result) => {
                                if (err) {
                                    console.error("Error al actualizar o insertar ganancia en la tabla sucursal_ganancias:", err);
                                    return res.status(500).send("Error al actualizar o insertar ganancia en la tabla sucursal_ganancias");
                                }

                                console.log(`Ganancia mensual y anual actualizada correctamente en la tabla sucursal_ganancias para la sucursal ${id_sucursal}`);

                                // Eliminar pedido de cart_orders
                                const deleteFromCartOrdersQuery = `
                                    DELETE FROM cart_orders
                                    WHERE order_id = ?`;

                                connection.query(deleteFromCartOrdersQuery, [order_id], (err, result) => {
                                    if (err) {
                                        console.error("Error al eliminar pedido de cart_orders:", err);
                                        return res.status(500).send("Error al eliminar pedido de cart_orders");
                                    }

                                    console.log(`Pedido ${order_id} eliminado de cart_orders correctamente`);
                                    res.redirect('/vendedor');
                                });
                            });
                        });
                    });
                });
            } else {
                res.redirect('/vendedor');
            }
        });
    });
});

// Ruta para obtener pedidos del bodeguero y renderizar la vista
app.get('/bodeguero/:empleado_id', (req, res) => {
    const { empleado_id } = req.params;

    const getPedidosQuery = `
        SELECT o.order_id, o.user_id, o.product_id, o.payment_method, o.delivery_option, o.direccion_envio, o.estado, o.empleado_id, o.id_sucursal, o.total, p.nombre_producto, u.name as nombre_usuario, s.nombre_sucursal
        FROM orders o
        JOIN products p ON o.product_id = p.product_id
        JOIN users u ON o.user_id = u.user_id
        JOIN sucursal s ON o.id_sucursal = s.id_sucursal
        WHERE o.empleado_id = ? AND o.estado != 'COMPLETADO'
    `;

    connection.query(getPedidosQuery, [empleado_id], (err, rows) => {
        if (err) {
            console.error("Error al obtener los pedidos del bodeguero:", err);
            return res.status(500).send("Error al obtener los pedidos del bodeguero");
        }

        res.render('bodeguero', { pedidos: rows, empleado_id: empleado_id });
    });
});

// Cambiar estado del pedido a COMPLETADO
app.post('/bodeguero/updatePedido/:order_id', (req, res) => {
    const { order_id } = req.params;
    const { estado, empleado_id } = req.body;

    if (!order_id || !estado || !empleado_id) {
        return res.status(400).send("Se requiere el order_id, estado y empleado_id para actualizar el pedido");
    }

    if (estado !== 'COMPLETADO') {
        return res.status(400).send("El estado debe ser 'COMPLETADO'");
    }

    const updatePedidoQuery = `
        UPDATE orders
        SET estado = ?
        WHERE order_id = ? AND estado != 'COMPLETADO'
    `;

    connection.query(updatePedidoQuery, [estado, order_id], (err, result) => {
        if (err) {
            console.error("Error al actualizar el estado del pedido:", err);
            return res.status(500).send("Error al actualizar el estado del pedido");
        }

        console.log(`Estado del pedido ${order_id} actualizado correctamente a ${estado}`);
        res.redirect(`/bodeguero/${empleado_id}`);
    });
});





//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 
//VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS //VISTAS 





// Detalle del producto
app.get('/producto/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM products WHERE product_id = ?';
    connection.query(query, [productId], (err, result) => {
        if (err) {
            console.error("Error al obtener el producto:", err);
            res.status(500).send("Error al obtener el producto");
        } else {
            res.render('productos_detalle', { product: result[0] });
        }
    });
});

// Perfil de usuario
app.get('/profile', (req, res) => {
    if (req.session.loggedin) {
        const { user_id } = req.session;
        const query = 'SELECT * FROM users WHERE user_id = ?';

        connection.query(query, [user_id], (err, result) => {
            if (err) {
                console.error("Error al obtener datos de usuario:", err);
                res.status(500).send("Error al obtener datos de usuario");
            } else {
                res.render('profile', {
                    login: true,
                    name: req.session.name,
                    user: result[0]
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Historial de compras del usuario
app.get('/historial_compras', (req, res) => {
    if (req.session.loggedin) {
        const { user_id } = req.session;
        const query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC';

        connection.query(query, [user_id], (err, results) => {
            if (err) {
                console.error("Error al obtener historial de compras:", err);
                res.status(500).send("Error al obtener historial de compras");
            } else {
                res.render('historial_compras', {
                    login: true,
                    name: req.session.name,
                    orders: results
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});










///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSVV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSVV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSVV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV




// Ruta para agregar productos desde un archivo CSV
app.post('/productsCSV', (req, res) => {
    const products = req.body; // Obtener el arreglo de productos del cuerpo de la solicitud

    // Validar que se recibieron datos
    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).send("Se requiere al menos un producto para la inserción");
    }

    // Mapear los productos para insertarlos en la base de datos
    const values = products.map(product => [
        product.product_id,
        product.nombre_producto,
        product.descripcion_producto,
        product.stock,
        product.precio,
        product.imagen
    ]);

    // Query para inserción masiva
    const insertQuery = 'INSERT INTO products (product_id, nombre_producto, descripcion_producto, stock, precio, imagen) VALUES ?';

    // Ejecutar la consulta de inserción
    connection.query(insertQuery, [values], (err, result) => {
        if (err) {
            console.error("Error al insertar productos:", err);
            res.status(500).send("Error al insertar productos");
        } else {
            console.log("Productos agregados correctamente");
            res.status(201).send("Productos agregados correctamente");
        }
    });
});



// Endpoint para agregar una nueva sucursal
app.post('/sucursal', (req, res) => {
    const { id_sucursal, nombre_sucursal, direccion_sucursal, ganancias } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!id_sucursal || !nombre_sucursal || !direccion_sucursal || !ganancias) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Insertar los datos en la base de datos
    const sql = `
        INSERT INTO sucursal (id_sucursal, nombre_sucursal, direccion_sucursal, ganancias)
        VALUES (?, ?, ?, ?)
    `;
    const values = [id_sucursal, nombre_sucursal, direccion_sucursal, ganancias];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al agregar la sucursal: ' + err.message);
            return res.status(500).json({ error: 'Error al agregar la sucursal' });
        }

        res.json({ message: 'Sucursal agregada correctamente' });
    });
});


// Ruta para agregar productos a sucursales desde un archivo CSV
app.post('/productsSucursalCSV', (req, res) => {
    const products = req.body; // Obtener el arreglo de productos del cuerpo de la solicitud

    // Validar que se recibieron datos
    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).send("Se requiere al menos un producto para la inserción");
    }

    // Mapear los productos para insertarlos en la base de datos
    const values = products.map(product => [
        product.product_id,
        product.id_sucursal,
        product.stock
    ]);

    // Query para inserción masiva en product_sucursal
    const insertQuery = 'INSERT INTO product_sucursal (product_id, id_sucursal, stock) VALUES ?';

    // Ejecutar la consulta de inserción
    connection.query(insertQuery, [values], (err, result) => {
        if (err) {
            console.error("Error al insertar productos en product_sucursal:", err);
            res.status(500).send("Error al insertar productos en product_sucursal");
        } else {
            console.log("Productos agregados correctamente a product_sucursal");
            res.status(201).send("Productos agregados correctamente a product_sucursal");
        }
    });
});


// Ruta para agregar nuevos usuarios en archivo CSV
app.post('/usersCSV', (req, res) => {
    const users = req.body; // Obtener el arreglo de usuarios del cuerpo de la solicitud

    // Validar que se recibieron datos
    if (!users || !Array.isArray(users) || users.length === 0) {
        return res.status(400).send("Se requiere al menos un usuario para la inserción");
    }

    // Mapear los usuarios para insertarlos en la base de datos
    const values = users.map(user => [
        user.user_id,
        user.rut_user,
        user.dv_user,
        user.user,
        user.name,
        user.correo,
        user.password,
        user.user_type_id
    ]);

    // Query para inserción masiva
    const insertQuery = 'INSERT INTO users (user_id, rut_user, dv_user, user, name, correo, password, user_type_id) VALUES ?';

    // Ejecutar la consulta de inserción
    connection.query(insertQuery, [values], (err, result) => {
        if (err) {
            console.error("Error al insertar usuarios:", err);
            res.status(500).send("Error al insertar usuarios");
        } else {
            console.log("Usuarios agregados correctamente");
            res.status(201).send("Usuarios agregados correctamente");
        }
    });
});

//Agregar productos a carrito
app.post('/addToCart', (req, res) => {
    const items = req.body; // Obtener los productos del cuerpo de la solicitud

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send("Se requiere al menos un producto para la inserción");
    }

    // Array para almacenar los valores a insertar en carrito_items
    let values = [];

    // Consulta para obtener el precio de los productos
    const getProductPriceQuery = 'SELECT product_id, precio FROM products WHERE product_id IN (?)';
    const productIds = items.map(item => item.product_id);

    connection.query(getProductPriceQuery, [productIds], (err, results) => {
        if (err) {
            console.error("Error al obtener precios de productos:", err);
            return res.status(500).send("Error al obtener precios de productos");
        }

        // Mapear los productos con su precio correspondiente
        const productPrices = {};
        results.forEach(row => {
            productPrices[row.product_id] = row.precio;
        });

        // Mapear los productos para insertarlos en la base de datos
        values = items.map(item => {
            const precio = productPrices[item.product_id];
            const total = precio * item.quantity; // Calcular el total

            return [
                item.user_id,
                item.product_id,
                item.quantity,
                item.id_sucursal,
                item.direccion_envio || null,
                total // Agregar el total calculado
            ];
        });

        // Query para inserción masiva en carrito_items
        const insertQuery = `
            INSERT INTO carrito_items (user_id, product_id, quantity, id_sucursal, direccion_envio, total) 
            VALUES ?`;

        connection.query(insertQuery, [values], (err, result) => {
            if (err) {
                console.error("Error al insertar productos en carrito_items:", err);
                res.status(500).send("Error al insertar productos en carrito_items");
            } else {
                console.log("Productos agregados correctamente a carrito_items");
                res.status(201).send("Productos agregados correctamente a carrito_items");
            }
        });
    });
});


// Confirmar compra del carrito
app.post('/confirmOrder', (req, res) => {
    const { cart_id } = req.body;

    if (!cart_id) {
        return res.status(400).send("Se requiere el cart_id para confirmar la orden");
    }

    // Consulta para obtener los datos del carrito
    const getCartQuery = `
        SELECT ci.user_id, ci.product_id, ci.quantity, ci.id_sucursal, ci.direccion_envio
        FROM carrito_items ci
        WHERE ci.cart_id = ?`;

    // Insertar en cart_orders
    const insertOrderQuery = `
    INSERT INTO cart_orders (cart_id, user_id, product_id, quantity, id_sucursal, direccion_envio, estado, total)
    SELECT ci.cart_id, ci.user_id, ci.product_id, ci.quantity, ci.id_sucursal, ci.direccion_envio, 'PENDIENTE', SUM(p.precio * ci.quantity) as total
    FROM carrito_items ci
    JOIN products p ON ci.product_id = p.product_id
    WHERE ci.cart_id = ?
    GROUP BY ci.cart_id, ci.user_id, ci.id_sucursal, ci.direccion_envio`;

    // Borrar datos del carrito_items después de insertar en cart_orders
    const deleteCartItemsQuery = `
        DELETE FROM carrito_items
        WHERE cart_id = ?`;

    // Ejecutar la consulta
    connection.query(getCartQuery, [cart_id], (err, results) => {
        if (err) {
            console.error("Error al obtener datos del carrito:", err);
            return res.status(500).send("Error al confirmar la orden");
        }

        if (results.length === 0) {
            return res.status(404).send("No se encontraron productos en el carrito con el cart_id proporcionado");
        }

        // Iniciar transacción para asegurar la integridad de los datos
        connection.beginTransaction(err => {
            if (err) {
                console.error("Error al iniciar la transacción:", err);
                return res.status(500).send("Error al confirmar la orden");
            }

            connection.query(insertOrderQuery, [cart_id], (err, result) => {
                if (err) {
                    connection.rollback(() => {
                        console.error("Error al insertar orden en cart_orders:", err);
                        res.status(500).send("Error al confirmar la orden");
                    });
                } else {
                    // Borrar datos del carrito_items después de confirmar la orden
                    connection.query(deleteCartItemsQuery, [cart_id], (err, result) => {
                        if (err) {
                            connection.rollback(() => {
                                console.error("Error al borrar datos de carrito_items:", err);
                                res.status(500).send("Error al confirmar la orden");
                            });
                        } else {
                            connection.commit(err => {
                                if (err) {
                                    connection.rollback(() => {
                                        console.error("Error al confirmar la transacción:", err);
                                        res.status(500).send("Error al confirmar la orden");
                                    });
                                } else {
                                    console.log("Orden confirmada correctamente");
                                    res.status(201).send("Orden confirmada correctamente");
                                }
                            });
                        }
                    });
                }
            });
        });
    });
});


// Agregar Empleado desde CSV
app.post('/addEmployee', async (req, res) => {
    const { empleado_id, rut_empleado, dv_empleado, name, lastname, correo, user_type_id, id_sucursal } = req.body;

    if (!empleado_id || !rut_empleado || !dv_empleado || !name || !lastname || !correo || !user_type_id || !id_sucursal) {
        return res.status(400).send("Se requieren todos los campos para agregar un empleado");
    }

    const initials = `${name.charAt(0)}${lastname.charAt(0)}`.toLowerCase();
    const rutPart = rut_empleado.substring(0, 4);
    const user = `${initials}${rutPart}`;
    const password = `${initials}${rutPart}`;

    try {
        const insertEmployeeQuery = `
            INSERT INTO empleados (empleado_id, rut_empleado, dv_empleado, user, name, correo, password, user_type_id, id_sucursal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(insertEmployeeQuery, [empleado_id, rut_empleado, dv_empleado, user, `${name} ${lastname}`, correo, password, user_type_id, id_sucursal], (err, results) => {
            if (err) {
                console.error("Error al insertar empleado:", err);
                return res.status(500).send("Error al agregar el empleado");
            }

            console.log("Empleado agregado correctamente");
            res.status(201).send("Empleado agregado correctamente");
        });
    } catch (error) {
        console.error("Error al encriptar la contraseña:", error);
        res.status(500).send("Error al agregar el empleado");
    }
});



// Endpoint para aceptar una orden desde cart_orders
app.post('/acceptOrder', async (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).send("Se requiere el ID de la orden para aceptarla.");
    }

    try {
        // Verificar si la orden ya ha sido aceptada o rechazada previamente
        const checkOrderQuery = `
            SELECT estado, total, id_sucursal FROM cart_orders WHERE order_id = ?`;

        connection.query(checkOrderQuery, [order_id], (err, results) => {
            if (err) {
                console.error("Error al verificar el estado de la orden en cart_orders:", err);
                return res.status(500).send("Error al procesar la solicitud");
            }

            if (results.length === 0) {
                return res.status(404).send("La orden especificada no existe en cart_orders.");
            }

            const { estado, total, id_sucursal } = results[0];

            if (estado !== 'PENDIENTE') {
                return res.status(400).send("La orden ya ha sido aceptada o rechazada previamente en cart_orders.");
            }

            // Obtener detalles de la orden desde cart_orders
            const getOrderDetailsQuery = `
                SELECT co.user_id, co.product_id, co.quantity, co.id_sucursal, co.direccion_envio, e.empleado_id
                FROM cart_orders co
                INNER JOIN sucursal s ON co.id_sucursal = s.id_sucursal
                INNER JOIN empleados e ON s.id_sucursal = e.id_sucursal AND e.user_type_id = 3
                WHERE co.order_id = ?`;

            connection.query(getOrderDetailsQuery, [order_id], (err, orderDetails) => {
                if (err) {
                    console.error("Error al obtener detalles de la orden desde cart_orders:", err);
                    return res.status(500).send("Error al procesar la solicitud");
                }

                if (orderDetails.length === 0) {
                    return res.status(404).send("No se encontraron detalles de la orden en cart_orders.");
                }

                const { user_id, product_id, quantity, direccion_envio, empleado_id } = orderDetails[0];

                // Iniciar transacción para asegurar la integridad de los datos
                connection.beginTransaction(err => {
                    if (err) {
                        console.error("Error al iniciar la transacción:", err);
                        return res.status(500).send("Error al aceptar la orden");
                    }

                    // Actualizar estado de la orden a ACEPTADO en cart_orders
                    const acceptOrderQuery = `
                        UPDATE cart_orders
                        SET estado = 'ACEPTADO'
                        WHERE order_id = ?`;

                    connection.query(acceptOrderQuery, [order_id], (err, updateResult) => {
                        if (err) {
                            connection.rollback(() => {
                                console.error("Error al aceptar la orden en cart_orders:", err);
                                return res.status(500).send("Error al procesar la solicitud");
                            });
                        } else {
                            // Insertar la orden aceptada en orders
                            const insertOrderQuery = `
                                INSERT INTO orders (user_id, product_id, payment_method, delivery_option, direccion_envio, estado, empleado_id, id_sucursal, total)
                                VALUES (?, ?, 'Pago en línea', 'Envío a domicilio', ?, 'ACEPTADO', ?, ?, ?)`;

                            connection.query(insertOrderQuery, [user_id, product_id, direccion_envio, empleado_id, id_sucursal, total], (err, insertResult) => {
                                if (err) {
                                    connection.rollback(() => {
                                        console.error("Error al insertar la orden en orders:", err);
                                        return res.status(500).send("Error al procesar la solicitud");
                                    });
                                } else {
                                    // Actualizar ganancias de la sucursal
                                    const updateSucursalGananciasQuery = `
                                        UPDATE sucursal
                                        SET ganancias = ganancias + ?
                                        WHERE id_sucursal = ?`;

                                    connection.query(updateSucursalGananciasQuery, [total, id_sucursal], (err, updateResult) => {
                                        if (err) {
                                            connection.rollback(() => {
                                                console.error("Error al actualizar ganancias de sucursal:", err);
                                                return res.status(500).send("Error al procesar la solicitud");
                                            });
                                        } else {
                                            // Insertar o actualizar ganancia mensual y anual en sucursal_ganancias
                                            const currentDate = new Date();
                                            const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
                                            const currentYear = currentDate.getFullYear();

                                            const upsertSucursalGananciaQuery = `
                                                INSERT INTO sucursal_ganancias (id_sucursal, mes, año, ganancia_mensual, ganancia_anual)
                                                VALUES (?, ?, ?, ?, ?)
                                                ON DUPLICATE KEY UPDATE
                                                ganancia_mensual = ganancia_mensual + VALUES(ganancia_mensual),
                                                ganancia_anual = ganancia_anual + VALUES(ganancia_mensual)`;

                                            connection.query(upsertSucursalGananciaQuery, [id_sucursal, currentMonth, currentYear, total, total], (err, updateResult) => {
                                                if (err) {
                                                    connection.rollback(() => {
                                                        console.error("Error al insertar o actualizar ganancia en sucursal_ganancias:", err);
                                                        return res.status(500).send("Error al procesar la solicitud");
                                                    });
                                                } else {
                                                    // Eliminar la orden de cart_orders
                                                    const deleteCartOrderQuery = `
                                                        DELETE FROM cart_orders
                                                        WHERE order_id = ?`;

                                                    connection.query(deleteCartOrderQuery, [order_id], (err, deleteResult) => {
                                                        if (err) {
                                                            connection.rollback(() => {
                                                                console.error("Error al eliminar la orden de cart_orders:", err);
                                                                return res.status(500).send("Error al procesar la solicitud");
                                                            });
                                                        } else {
                                                            connection.commit(err => {
                                                                if (err) {
                                                                    connection.rollback(() => {
                                                                        console.error("Error al confirmar la transacción:", err);
                                                                        res.status(500).send("Error al confirmar la orden");
                                                                    });
                                                                } else {
                                                                    console.log("Orden aceptada correctamente");
                                                                    res.status(200).send("Orden aceptada correctamente");
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error("Error general al aceptar la orden:", error);
        res.status(500).send("Error al procesar la solicitud");
    }
});

// Ruta para obtener el informe de ganancias de una sucursal
app.get('/informe-ganancias/:id_sucursal', (req, res) => {
    const id_sucursal = req.params.id_sucursal;

    // Consulta SQL para obtener el informe de ganancias
    const sql = `
        SELECT mes, año, ganancia_mensual, ganancia_anual
        FROM sucursal_ganancias
        WHERE id_sucursal = ?
    `;

    // Ejecutar la consulta en la base de datos
    connection.query(sql, [id_sucursal], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener el informe de ganancias' });
            throw err;
        }
        
        res.json(results);
    });
});



// Ruta para ingresar ganancia mensual de una sucursal
app.post('/ingresar-ganancia-mensual', (req, res) => {
    const { id_sucursal, mes, año, ganancia_mensual } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!id_sucursal || !mes || !año || !ganancia_mensual) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Insertar los datos en la base de datos
    const sql = `
        INSERT INTO sucursal_ganancias (id_sucursal, mes, año, ganancia_mensual, ganancia_anual)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE ganancia_mensual = VALUES(ganancia_mensual), ganancia_anual = ganancia_anual + VALUES(ganancia_mensual)
    `;
    const values = [id_sucursal, mes, año, ganancia_mensual, ganancia_mensual];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al ingresar la ganancia mensual: ' + err.message);
            return res.status(500).json({ error: 'Error al ingresar la ganancia mensual' });
        }

        res.json({ message: 'Ganancia mensual ingresada correctamente' });
    });
});




///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSVV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSVV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV
///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSVV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV///CSVCSVCSVCSVSCVCSCSVCSV






app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
