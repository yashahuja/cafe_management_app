const express = require('express');
const connection = require('../connection');
const router = express.Router();
let ejs = require('ejs')
let pdf = require('html-pdf')
let path = require('path')
var fs = require('fs');
var uuid = require('uuid');
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');
const { log } = require('console');

router.post('/generateReport', auth.authenticateToken, (req, res)=>{
    console.log('entered');
    const generateUuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);

    var query = 'insert into bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) values(?,?,?,?,?,?,?,?)'
    connection.query(query, [orderDetails.name, generateUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.totalAmount, orderDetails.productDetails, res.locals.email], (err, result)=>{
        if(!err){
            ejs.renderFile(path.join(__dirname, '', 'report.ejs'),{productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount}, (err, result)=>{
                if(!err){
                    console.log('no error');
                    pdf.create(result).toFile('./generated_pdf/'+generateUuid+".pdf", function(err, data){
                        if(err){
                            console.log(err);
                            return res.status(500).json(err);
                        }else{
                            return res.status(200).json({uuid: generateUuid});
                        }
                    })
                }else{
                    console.log(err);
                    return res.status(500).json(err);
                }
            })
        }else{
            return res.status(500).json(err);
        }
    })
});

router.post('/getPdf', auth.authenticateToken, function(req, res){
    const orderDetails = req.body;
    const pdfPath = './generated_pdf/'+orderDetails.uuid+'.pdf';
    if(fs.existsSync(pdfPath)){
        res.contentType('application/pdf');
        fs.createReadStream(pdfPath).pipe(res);
    }else{
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname, '', 'report.ejs'),{productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount}, (err, result)=>{
            if(!err){
                console.log('no error');
                pdf.create(result).toFile('./generated_pdf/'+orderDetails.uuid+".pdf", function(err, data){
                    if(err){
                        console.log(err);
                        return res.status(500).json(err);
                    }else{
                        res.contentType('application/pdf');
        fs.createReadStream(pdfPath).pipe(res);
                    }
                })
            }else{
                console.log(err);
                return res.status(500).json(err);
            }
        })
    }
});


module.exports = router;