const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
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

router.post('/login',(req,res)=>{
    const user = req.body;
    query = 'select email, password,role,status from user where email=?';
    connection.query(query,[user.email], (err,result)=>{
        if(!err){
            if(result.length<=0 || result[0].password !==user.password){
                return res.status(401).json({message: 'Incorrect username or password'});
            }else if(result[0].status === 'false'){
                return res.status(401).json({message: "wait for admin approval"});
            }else if(results[0].password === user.password){

            }else{
                return res.status(400).json({message:"Something went wrong please try again later"});
            }
        }else{
            return res.status(500).json(err);            
        }
    })
})
module.exports = router;