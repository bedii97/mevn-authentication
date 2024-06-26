const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../config/keys').secret;
const User = require('../../model/User');

//Confirm password uyuşuyor mu ve Email unique mi diye bir middleware yazılabilir 
//router.use();
/**
 * @route POST api/users/register
 * @desc Register the User
 * @access Public
 */
router.post('/register', (req, res) => {
    let { name, username, email, password, confirm_password } = req.body;
    console.log(password);
    if (password !== confirm_password) {
        return res.status(400).json({
            msg: "Password do not match."
        });
    } else {
        //Check for the unique Username
        User.findOne({
            username: username
        }).then(user => {
            if (user) {
                return res.status.json({
                    msg: "Username is already taken."
                });
            }
        });
        //Check for the unique Email
        User.findOne({
            email: email
        }).then(user => {
            if (user) {
                return res.status.json({
                    msg: "Email is already taken."
                });
            }
        });
        //The data is valid and new we can register the user
        let newUser = new User({
            name,
            username,
            password,
            email
        });
        //Hash the password
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash (newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save().then(user => {
                    return res.status(201).json({
                        success: true,
                        msg: "User is now registered"
                    });
                });
            });
        });
    }
});
/**
 * @route POST api/users/login
 * @desc Signing in the User
 * @access Public
 */
router.post('/login', (req, res) =>{
    User.findOne({username: req.body.username}).then(user => {
        if(!user){
            return res.status(404).json({
                msg: "Username is not found",
                success: false
            });
        }else{
            //if there is user we are now going to compare the password
            bcrypt.compare(req.body.password, user.password).then(isMatch =>{
                if(isMatch){
                    //User's password is correct and we need to sen the json token for that user
                    const payload = {
                        _id: user._id,
                        username: user.username,
                        name: user.name,
                        email: user.email
                    };
                    //Saniye cinsinden expiresIn alıyor
                    jwt.sign(payload, key, {expiresIn: 604800}, (err, token) =>{
                        res.status(200).json({
                            success: true,
                            token: `Bearer ${token}`,
                            user: user,
                            msg: "Hurry! You are now logged in."
                        });
                    });
                }else{
                    return res.status(404).json({
                        msg: "Incorrect password",
                        success: false
                    });
                }
            })
        }
    })
});
/**
 * @route POST api/users/profile
 * @desc Return the User's Data
 * @access Private
 */
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res)=>{
    return res.json({
        user: req.user
    });
    //res.send(req.user);
});

module.exports = router;