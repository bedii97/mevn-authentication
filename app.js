const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport');

//Initialize the app
const app = express();

//Middlewares
//Form data and json body middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// Cors middleware
app.use(cors());
//Setting up the static directory
app.use(express.static(path.join(__dirname, 'public')));
//Use the passport Middleware
app.use(passport.initialize());
//Bring in the Passport Strategy
require('./config/passport')(passport);

//Bring in the database config and connect with the database
const db = require('./config/keys').mongoURI;
const { Console } = require('console');
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
console.log(`Database connected successfully ${db}`);
})
.catch(err=>{
    console.log(err);
});

//Bring in the Users route
const users = require('./routes/api/users');
//const passport = require('passport');
app.use('/api/users', users);

app.get('*', (req, res) =>{
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

//Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{console.log(`Server running on http://localhost:${PORT}`)});
