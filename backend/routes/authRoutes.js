const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const poolPromise = require('../config/db'); // Import the poolPromise
const router = express.Router();
require('dotenv').config();

// Register User
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Resolve the poolPromise to get the pool object
        const pool = await poolPromise;

        // Check if the username already exists
        const result = await pool.request()
            .input('username', username)
            .query('SELECT * FROM users WHERE username = @username');
        
        if (result.recordset.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        await pool.request()
            .input('username', username)
            .input('password', hashedPassword)
            .query('INSERT INTO users (username, password) VALUES (@username, @password)');

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Resolve the poolPromise to get the pool object
        const pool = await poolPromise;

        // Check if the user exists
        const result = await pool.request()
            .input('username', username)
            .query('SELECT * FROM users WHERE username = @username');
        
        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = result.recordset[0];

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET is not defined in the environment variables.');
            return res.status(500).json({ message: 'Internal server error' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, username: user.username  }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

module.exports = router;