const express = require('express');
const { check, validationResuls } = require('express-validator');
const connectDB = require('./config/db');

const app = express();

connectDB();

// Init Body Parser Middleware
// Allows us to get data from req.body
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
    res.send('Express API running.');
})

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/projects', require('./routes/api/projects'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/users', require('./routes/api/users'));

module.exports = app;
