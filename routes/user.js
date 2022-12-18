const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

var auth = require('../services/authentication')
var checkRole = require('../services/checkRole')

router.post('/signup', (req, res) => {
    let user = req.body;
    query = 'select email,password,role,status from user where email=?'
    connection.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                query = 'insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,"false","user")'
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, result) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfully Registered" })
                    } else {
                        return res.status(500).json(err);
                    }
                })
            } else {
                return res.status(200).json({ message: "User already exists" })
            }

        } else {
            res.status(500).json(err);
        }
    })
})

router.post('/login', (req, res) => {
    const user = req.body;
    query = 'select email, password,role,status from user where email=?';
    connection.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0 || result[0].password !== user.password) {
                return res.status(401).json({ message: 'Incorrect username or password' });
            } else if (result[0].status === 'false') {
                return res.status(401).json({ message: "wait for admin approval" });
            } else if (result[0].password === user.password) {
                const response = {
                    email: result[0].email,
                    role: result[0].role
                };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                res.status(200).json({ token: accessToken });
            } else {
                return res.status(400).json({ message: "Something went wrong please try again later" });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

var transport = nodemailer.createTransport({
    service: 'gamil',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    },
    host: 'smtp.gmail.com',
})

router.post('/forgotpassword', (req, res) => {
    const user = req.body;
    query = 'select email,password from user where email = ?;';
    connection.query(query, [user.email], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                return res.status(200).json({ message: 'email id not registered. try signup.' });
            } else {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: 'Password by cafe management system',
                    html: '<p>your login details for cafe management system</p><br><p>Email:' + result[0].email + '</p><br><p>Password: ' + result[0].password + '</p>'
                }
                transport.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("email sent - " + info.response);
                        return res.status(200).json({ message: 'Password sent successfully to your email.' });

                    }
                });
            }
        } else {
            return res.status(500).json(err)
        }
    })
})

router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    var query = 'select id, name, email, contactNumber, status from user where role="user"';
    connection.query(query, (err, result) => {
        if (!err) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = 'update user set status = ? where id = ?';
    connection.query(query, [user.status, user.id], (err, result) => {
        if (!err) {
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'user id does not exists' })
            }

            return res.status(200).json({ message: 'user updated successfully' });

        } else {
            return res.status(500).json(err);
        }
    });
});

router.get('/checktoken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: 'true' });
})

router.post('/changepassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = 'select * from user where email=? and password=?'
    connection.query(query, [email, user.oldPassword], (err, result) => {
        if (!err) {
            if (result.length <= 0) {
                return ressend(400).json({ message: "Incorrect old password" });
            } else if (result[0].password == user.oldPassword) {
                query = 'update user set password = ? where email = ?';
                connection.query(query, [user.newPassword, email], (err, result) => {
                    if (!err) {
                        return res.status(200).json({ message: 'password updated successfully' });
                    } else {
                        return res.status(500).json(err);
                    }
                })
            } else {
                return res.status(400).json({ message: 'something went wrong try again later' });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})
module.exports = router;