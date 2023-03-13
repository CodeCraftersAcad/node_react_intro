// dotenv
require('dotenv').config();

// Imports
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const PORT = process.env.PORT || 3000;

// Models
const User = require('./UserModel');

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(morgan('dev'));

const connectDb = async (env) => {
    try {
        let url;
        if (env === 'development') {
            url = process.env.MONGO_URL_DEV;
            console.log('Connecting to development database...');
        } else if (env === 'production') {
            url = process.env.MONGO_URL_PROD;
            console.log('Connecting to production database...');
        }
        const conn = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`DB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};



// routes
// Get route for user information
app.get('/user/:id', async (req, res) => {
    let id = req.params.id;
    let user = await User.findOne({_id: id});
    res.send(user);
});

// Post route for user registration
app.post('/register', async (req, res) => {
   let { name, email, password } = req.body;
    console.log(email, password, name, req.body)
    let user = await User.create({
        name,
        email,
        password
    });

    res.send({
        message: `Hello ${user.name}! You have successfully registered!`
    });
});

// Post route for user login
app.post('/login', async (req, res) => {
    let {email, password} = req.body;

    // Check for existing user
    const user = await User.findOne({email});
    if (!user) return res.status(400).send({msg: 'Invalid email/password'});

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({msg: 'Invalid email/password'});

    // Create token to authenticate user
    let token = 'oi2j92jffnjen-23r92j9fj44-23r929fj2' // This would be a JWT token in a real app

    return res.status(200).send({
        msg: 'Login successful',
        token,
    });
});


connectDb(process.env.NODE_ENV).then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
