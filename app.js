const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

// Configuración de motor de vistas y carpeta de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares globales
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'mi_clave_secreta',
    resave: false,
    saveUninitialized: false
}));

// Rutas
const productRoutes = require('./routes/product.routes');
app.use('/products', productRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/users', userRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

const cartRoutes = require('./routes/cart.routes');
app.use('/', cartRoutes);

const orderRoutes = require('./routes/order.routes');
app.use('/', orderRoutes);

const sucursalRoutes = require('./routes/sucursal.routes');
app.use('/', sucursalRoutes);

const employeeRoutes = require('./routes/employee.routes');
app.use('/', employeeRoutes);

const direccionRoutes = require('./routes/direccion.routes');
app.use('/', direccionRoutes);

const perfilRoutes = require('./routes/perfil.routes');
app.use('/', perfilRoutes);

const pagesRoutes = require('./routes/pages.routes');
app.use('/', pagesRoutes);

// Arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
