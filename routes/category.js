const express = require('express');
const connection = require('../connection');
const router = express.Router();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/add', auth.authenticateToken, checkRole.checkRole, (req,res)=>{
    let category = req.body;
    query = 'insert into category (name) values(?)';
    connection.query(query, [category.name], (err,result)=>{
        if(!err){
            return res.status(200).json({mwssage: 'category added successfully'});
        }else{
            returnres.status(500).json(err);
        }
    });
});

router.get('/get', auth.authenticateToken, (req,res,next)=>{
    var query = 'select * from category order by name';
    connection.query(query, (err,result)=>{
        if(!err){
            return res.status(200).json(result)
        }else{
            return res.status(500).json(err);
        }
    })
});

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req,res)=>{
    let product = req.body;
    var query = 'update category set name = ? where id = ?';
    connection.query(query, [product.name, product.id], (err, result)=>{
        if(!err){
            if(result.affectedRows == 0){
                return res.status(404).json({message: 'category id does not found'});
            }else{
                return res.status(200).json({message: 'categor updated successfully'});
            }
        }else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;