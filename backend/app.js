const express = require('express');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Import knihovny fs

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware pro parsování JSON
app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Kontrola a vytvoření složky uploads, pokud neexistuje
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Uploads folder created at:', uploadsDir);
}
// Připojení k databázi
const pool = mysql.createPool({
  host: "127.0.0.1",
  user: 'root',
  password: '',
  database: 'eshop'
});

// Pomocná funkce pro spuštění dotazů
const runQuery = async (query, params = []) => {
  const [rows] = await pool.query(query, params);
  return rows;
};


////////////// USERS ///////////

// add user
app.post('/users/login', async (req, res) => {
  console.log('Received request to create user:', req.body); // Add this line
  const { name, email, password, is_admin } = req.body;
  try {
    // Check if the email already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, is_admin || false]
    );

    res.status(201).json({ id: result.insertId, name, email });
  } catch (error) {
    console.log('Error:', error); // Log the error
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/users/login', async (req, res) => {
  try {
    const users = await runQuery('SELECT id, name, email, is_admin FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user
app.put('/users/:id/login', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, is_admin } = req.body;
  try {
    let query = 'UPDATE users SET name = ?, email = ?, is_admin = ? WHERE id = ?';
    let values = [name, email, is_admin || false, id];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET name = ?, email = ?, password = ?, is_admin = ? WHERE id = ?';
      values = [name, email, hashedPassword, is_admin || false, id];
    }

    const [result] = await runQuery(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
app.delete('/users/:id/login', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await runQuery('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Přihlášení uživatele
app.post('/users/login', async (req, res) => {
  const { email, password } = req.body; // Získání emailu a hesla z požadavku

  try {
    // Vyhledej uživatele podle emailu
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Uživatel nenalezen' });
    }

    const user = users[0]; // Načti prvního uživatele

    // Ověření hesla
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Špatné heslo' });
    }

    // Úspěšné přihlášení - vrací informace o uživateli
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin,
    });
  } catch (error) {
    console.error('Chyba při přihlášení:', error);
    res.status(500).json({ message: 'Interní chyba serveru' });
  }
});



////////////// PRODUCTS ///////////

// Create a new product
// Přidání produktu
app.post('/products', async (req, res) => {
  const { name, description, price_kc, price_eur, category_id, stock } = req.body;

  if (!name || !description || !price_kc || !price_eur || !category_id) {
    return res.status(400).json({ message: 'Všechna pole kromě image_url jsou povinná.' });
  }

  try {
    const [categories] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (categories.length === 0) {
      return res.status(400).json({ message: 'Neplatné category_id.' });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, description, price_kc, price_eur, category_id, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price_kc, price_eur, category_id, stock || 0]
    );

    res.status(201).json({ message: 'Produkt úspěšně přidán.', id: result.insertId });
  } catch (error) {
    console.error('Chyba při přidávání produktu:', error);
    res.status(500).json({ message: 'Chyba serveru.' });
  }
});









// Načtení všech kategorií
app.get('/categories', async (req, res) => {
  try {
    console.log('Připojení k databázi...');
    const categories = await runQuery('SELECT id, name FROM categories');
    console.log('Kategorie načteny:', categories);
    res.json(categories);
  } catch (error) {
    console.error('Chyba při načítání kategorií:', error);
    res.status(500).json({ message: 'Chyba při načítání kategorií.' });
  }
});









// Get all products or filter by category
app.get('/products', async (req, res) => {
  const { category_id } = req.query;
  try {
    const query = category_id
      ? 'SELECT * FROM products WHERE category_id = ?'
      : 'SELECT * FROM products';
    const products = await runQuery(query, category_id ? [category_id] : []);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, stock } = req.body;
  try {
    const [result] = await runQuery(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock = ? WHERE id = ?',
      [name, description, price, category_id, stock, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await runQuery('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////// ORDERS ///////////

// Create a new order
app.post('/orders', async (req, res) => {
  const { user_id, items, status } = req.body; 
  if (!user_id || !items || items.length === 0) {
    return res.status(400).json({ message: 'Order must include user_id and items.' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, status) VALUES (?, ?)',
      [user_id, status || 'pending']
    );
    const orderId = orderResult.insertId;

    // Add items to the order
    for (const { product_id, quantity } of items) {
      const [[product]] = await connection.query('SELECT stock FROM products WHERE id = ?', [product_id]);
      if (!product || product.stock < quantity) {
        await connection.rollback();
        return res.status(400).json({ message: `Not enough stock for product ID: ${product_id}` });
      }

      // Insert item into order_items
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
        [orderId, product_id, quantity]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [quantity, product_id]
      );
    }

    await connection.commit();
    connection.release();
    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







//Obrazky

app.post('/products', async (req, res) => {
  console.log("req.files:", req.files);

  const { name, description, price_kc, price_eur, category_id, stock } = req.body;

  if (!req.files || !req.files.image) {
    console.error("Missing image file.");
    return res.status(400).send("Obrázek je povinný.");
  }

  const image = req.files.image;
  const imagePath = path.join(__dirname, 'uploads', image.name);

  try {
    // Logování příchozích dat
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.files);

    // Uložení obrázku na server
    await image.mv(imagePath);
    console.log("Image saved to:", imagePath);

    // Vložení produktu do databáze
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price_kc, price_eur, category_id, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price_kc, price_eur, category_id, stock, `/uploads/${image.name}`]
    );

    console.log("Database insert result:", result);

    res.status(201).json({ message: 'Produkt vytvořen.', id: result.insertId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Chyba při ukládání produktu.' });
  }
});




// Get orders for a user
app.get('/orders/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const orders = await runQuery('SELECT * FROM orders WHERE user_id = ?', [user_id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    const orderDetails = [];
    for (const order of orders) {
      const items = await runQuery(
        'SELECT oi.*, p.name, p.price FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [order.id]
      );
      orderDetails.push({ ...order, items });
    }

    res.json(orderDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

