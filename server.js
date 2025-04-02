const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
app.use(bodyParser.json());

// SQL Server config
const dbConfig = {
  user: 'your_username',
  password: 'your_password',
  server: 'localhost',
  database: 'KnittingHavenDB',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Products');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('name', sql.NVarChar, req.body.name)
      .input('price', sql.Decimal, req.body.price)
      .input('description', sql.NVarChar, req.body.description)
      .input('image', sql.NVarChar, req.body.image)
      .query(`INSERT INTO Products (name, price, description, image) 
              VALUES (@name, @price, @description, @image)`);
    res.status(201).json({ message: 'Product created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add PUT and DELETE endpoints similarly

const PORT = 3000;
// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('password_hash', sql.NVarChar, hashedPassword)
            .query('INSERT INTO Users (username, email, password_hash) VALUES (@username, @email, @password_hash)');
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');
        
        if (user.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, user.recordset[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { userId: user.recordset[0].id, username: user.recordset[0].username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Product CRUD Endpoints

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Products');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Products WHERE id = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, description, image } = req.body;
        
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(10, 2), price)
            .input('description', sql.NVarChar, description)
            .input('image', sql.NVarChar, image)
            .query(`INSERT INTO Products (name, price, description, image) 
                   VALUES (@name, @price, @description, @image);
                   SELECT SCOPE_IDENTITY() AS id;`);
        
        const newProduct = {
            id: result.recordset[0].id,
            name,
            price,
            description,
            image
        };
        
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Error creating product' });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, price, description, image } = req.body;
        
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(10, 2), price)
            .input('description', sql.NVarChar, description)
            .input('image', sql.NVarChar, image)
            .query(`UPDATE Products SET 
                   name = @name, 
                   price = @price, 
                   description = @description, 
                   image = @image 
                   WHERE id = @id`);
        
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Products WHERE id = @id');
        
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

// Protect admin routes
app.use('/api/products*', (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const userExists = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (userExists.recordset.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .query('INSERT INTO Users (username, email, password_hash) VALUES (@username, @email, @password)');

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (user.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.recordset[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user.recordset[0].id, email: user.recordset[0].email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({ 
            token,
            user: {
                id: user.recordset[0].id,
                username: user.recordset[0].username,
                email: user.recordset[0].email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
