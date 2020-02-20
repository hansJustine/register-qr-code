const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
const randomize = require('randomatic');
const QRCode = require('qrcode');
const session = require('express-session');
require('dotenv').config();

//Model
const QrCodeModel = require('./models/qrcode');

const uri = process.env.DATABASE || "mongodb://localhost/qrcode";
const port = process.env.PORT || 5000;

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, useCreateIndex:true });
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({ cookie: { maxAge: 60000 }, 
    secret: 'woot',
    resave: false, 
    saveUninitialized: false}));
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.set("view engine", "ejs");

// This will be called on every route
app.use(function(req, res, next){
    // "res.locals" allows the req.user be available in every template
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: process.env.EMAIL,
           pass: process.env.PASS
    }
});
// For QR
var opts = {
    errorCorrectionLevel: 'L',
    type: 'image/jpeg',
    margin: 1,
    scale: 15
}


app.get('/', (req, res) => {
    res.render('registerQR');
})
//Register QRCode 
app.post('/register/qrcode', (req, res) => {
                        var qrcode = new QrCodeModel({
                            firstName: req.body.firstName,
                            surname: req.body.surname,
                            middleInitial: req.body.mi,
                            email: req.body.email,
                            contactNumber: req.body.contactNum,
                            relationshipToTheStudent: req.body.relationship,
                            isUsed: true
                        });
                        qrcode.save()
                            .then(savedQr => { 
                                req.flash('success', "You've successfully registered! Check your email to view your QR Code."); 
                                res.redirect('back');
                            })
                            .catch(err => {
                                req.flash('error', err.message);
                                res.redirect('back');
                            });
});

// app.post('/register/qrcode', (req, res) => {
//     QrCodeModel.find()
//         .then(qrcodes => {
//             function ifEmailIsRegistered(){
//                 for(var i = 0; i < qrcodes.length; i++){
//                     if(qrcodes[i].email == req.body.email){
//                         return true;
//                     }
//                 }
//                 return false;
//             }
//             console.log(ifEmailIsRegistered());
//             if(!ifEmailIsRegistered()){
//                 var randomCode = randomize('aA0', 8, { exclude: '0oOiIlL1' });
//                 QRCode.toDataURL(randomCode, opts)
//                     .then(url => {
//                         var qrcode = new QrCodeModel({
//                             code: randomCode,
//                             firstName: req.body.firstName,
//                             surname: req.body.surname,
//                             middleInitial: req.body.mi,
//                             email: req.body.email,
//                             contactNumber: req.body.contactNum,
//                             relationshipToTheStudent: req.body.relationship,
//                             isUsed: false
//                         });
//                         qrcode.save()
//                             .then(savedQr => { 
//                                 const mailOptions = {
//                                     from: process.env.EMAIL, // sender address
//                                     to: req.body.email, // list of receivers
//                                     subject: 'STI College Marikina Exposition', // Subject line
//                                     html: `<div><strong>Hello ${req.body.firstName}, Welcome To STI College Marikina 2020 Exposition!</strong></div> <div>This QR Code will be used to vote for your favorite booth.</div> <div>Enjoy your visit!</div>`, // plain text body
//                                     attachments: [
//                                         {
//                                             filename: `qr.jpg`,
//                                             content: url.split('base64,')[1],
//                                             encoding: 'base64'
//                                         }                
//                                     ]
//                                 };
//                                 transporter.sendMail(mailOptions, function (err, info) {
//                                     if(err){
//                                         console.log('Nodemailer:' + err)
//                                     }else{
//                                         req.flash('success', "You've successfully registered! Check your email to view your QR Code."); 
//                                         res.redirect('back')
//                                     }
//                                 })
//                             })
//                             .catch(err => {
//                                 req.flash('error', err.message);
//                                 res.redirect('back');
//                             });
//                     }).catch(err => console.log(err));
//             }else{
//                 req.flash('error', 'The email is already registered.');
//                 res.redirect('back');
//             }
//         }).catch(err => {
//             console.log(err)
//             res.redirect('back')
//         })
// });

app.get("*", (req, res) => {
    res.send("Error 404, Page Not Found")
});


app.listen(port, () => { console.log(`The server is listening to port ${port}`) });