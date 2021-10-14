// Include Middleware
const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Message = require('./models/message');
const flash = require('connect-flash');
const methodOverride = require('method-override');

// Set view engine to EJS
app.set('view engine', 'ejs');

// Establish Mongoose Connection
var mongoDB = 'mongodb://127.0.0.1/loginProjectMk2Database';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;

// Include Body-parser and Cookie-parser
app.use(bodyParser.urlencoded({ extended: false }));

// Include express-session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Include methodOverride;
app.use(methodOverride('X-HTTP-Method-Override'));

// Include Flash
app.use(flash());

// Define userid as a global variable
var userid;

// Include CSS
app.use(express.static('public'));

// Admin Page
app.get('/admin', (req, res) => {
    res.render('admin', { userid });
});

// Index HTML
app.get('/', (req, res) => {
    res.render('login');
});

// Delete All Users
app.post('/admin/deleteUsers', async (req, res) => {
    await User.deleteMany({});
    console.log('Users deleted');
});

// Delete All Messages
app.post('/admin/deleteMessages', async (req, res) => {
    await Message.deleteMany({});
    console.log('Messages deleted');
});

// Chat Page
app.get('/chatroom', async (req, res) => {
    const messages = await Message.find({});
    if (userid) {
        res.render('chatroom', { userid, messages });
    } else {
        req.flash('error', 'Please login to access this page');
        res.redirect('/login');
    }
});

// Sending messages
app.post('/chatroom', async (req, res) => {
    const { message } = req.body;

    // Create New Message
    const newMessage = new Message({
        username: userid,
        text: message
    });

    // Save New Message
    newMessage.save();
    console.log(newMessage);

    res.redirect('/chatroom');
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login', { userid, messages: req.flash('error') });
});

// Login process
app.post('/login', async (req, res) => {
    // Extract data from login form
    const { username, password } = req.body;

    // Define current user
    const currentUser = await User.findOne({ username });

    // Check user is registered
    if (currentUser) {
        // Check password
        bcrypt.compare(password, currentUser.password, (err, match) => {
            if (err) {
                throw err;
            } else if (!match) {
                req.flash('error', 'Incorrect username or password');
                res.redirect('/login');
            } else {
                console.log('Login Successful');
                res.redirect('/chatroom');
                req.session.userid = username;
                userid = req.session.userid; 
            };
        });
    } else {
        req.flash('error', 'Incorrect username or password');
        res.redirect('/login');
    };
});

// Register Page
app.get('/register', (req, res) => {
    res.render('register', { userid, messages: req.flash('error') });
});

// Register User
app.post('/register', async (req, res) => {
    const { username, confirmUsername, password, confirmPassword } = req.body;

    // Check for existing user
    const existingUsername = await User.findOne({ username: username});
    if (existingUsername) {
        req.flash('error', 'User already registered');
        res.redirect('/register');
    } else {
        // Check that usernames and passwords match confirmation
        if (username === confirmUsername) {
            if (password === confirmPassword) {
                // Hash Password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create New User
                const newUser = new User({
                    username: username,
                    password: hashedPassword
                });

                // Save New User
                newUser.save();

                // Redirect to login page
                res.redirect('/login');
            } else {
                console.log('passwords do not match, try again');
                res.redirect('/register');
            };
        } else {
            console.log('usernames do not match, try again');
            res.redirect('/register');
        };
    };
});

// Logout
app.get('/logout', (req, res) => {
    userid = undefined;
    delete(userid);
    res.redirect('/login');
});

// Check application is running
app.listen(3000);
console.log('Server online');