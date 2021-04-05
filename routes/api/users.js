const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route   GET api/users
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('User Route'));

// @route  POST api/users
// @desc   Register User to the website (name, email and password)
// @access Public
router.post('/', [
    check('name', 'Name is required...')
        .not()
        .isEmpty(),
    check('email', 'Please include a vaild email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
        .isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        // See if user exists
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists...' }] })
        }

        user = new User({
            name,
            email,
            password
        })
        // Encrypt pass
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // Save the user to the DB
        await user.save();
        // Return jwt
        const payload = {
            user: {
                id: user.id
            }
        }

        // Remove the password from the returning json
        let userObj = user.toObject();
        delete userObj.password;

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token,
                    userObj
                })
            }
        );
        
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error...');
    }
})

module.exports = router;

