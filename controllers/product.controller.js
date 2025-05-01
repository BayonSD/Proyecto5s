// controllers/product.controller.js
const connection = require('../database/db');

exports.getAllProducts = (req, res) => {
  const query = 'SELECT * FROM products';

  connection.query(query, (err, productos) => {
    if (err) {
      return res.status(500).send("Error al obtener los productos");
    }

    res.render('products', { productos }); // ← importante
  });
};


exports.getProductById = (req, res) => {
    const productId = req.params.id;
    connection.query('SELECT * FROM products WHERE product_id = ?', [productId], (err, result) => {
        if (err) {
            console.error("Error al obtener el producto:", err);
            res.status(500).send("Error al obtener el producto");
        } else {
            res.json(result[0]);
        }
    });
};

exports.createProducts = (req, res) => {
    const products = req.body;
    if (!Array.isArray(products)) {
        return res.status(400).json({ message: 'Se esperaba un arreglo de productos.' });
    }

    const values = products.map(product => [
        product.nombre_producto,
        product.descripcion_producto,
        product.stock,
        product.precio,
        product.imagen
    ]);

    connection.query(
        'INSERT INTO products (nombre_producto, descripcion_producto, stock, precio, imagen) VALUES ?',
        [values],
        (err) => {
            if (err) {
                console.error("Error al insertar productos:", err);
                res.status(500).json({ message: 'Error al insertar productos.' });
            } else {
                res.status(201).json({ message: 'Productos agregados correctamente.' });
            }
        }
    );
};

exports.updateProduct = (req, res) => {
    const productId = req.params.id;
    const { nombre_producto, descripcion_producto, stock, precio, imagen } = req.body;

    const query = `
        UPDATE products 
        SET nombre_producto = ?, descripcion_producto = ?, stock = ?, precio = ?, imagen = ? 
        WHERE product_id = ?`;

    connection.query(query, [nombre_producto, descripcion_producto, stock, precio, imagen, productId], (err) => {
        if (err) {
            console.error("Error al actualizar el producto:", err);
            res.status(500).send("Error al actualizar el producto");
        } else {
            res.json({ message: 'Producto actualizado' });
        }
    });
};

exports.deleteProduct = (req, res) => {
    const productId = req.params.id;
    connection.query('DELETE FROM products WHERE product_id = ?', [productId], (err) => {
        if (err) {
            console.error("Error al eliminar el producto:", err);
            res.status(500).send("Error al eliminar el producto");
        } else {
            res.json({ message: 'Producto eliminado' });
        }
    });
};
