const express = require('express');
const connectDB = require('./config/db');
const { check, validationResuls } = require('express-validator/check');

const app = express();

// Connect Database
connectDB();

// Init Body Parser Middleware
// Allows us to get data from req.body
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
    res.send('Express API running.')
})

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/tickets', require('./routes/api/tickets'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/users', require('./routes/api/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});
