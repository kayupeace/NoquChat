'use strict';
//let RoomTable = require(__base + 'models/room.js');

let nodemailer = require('nodemailer');
let handlebars = require('handlebars');
let fs = require('fs');

let readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function(err, html){
        if(err){
            //throw err;
            console.log(err);
            callback(err);
        }
        else{
            callback(null, html);
        }
    })
};

let sendResetPassword = function(email, username, name, tokenUrl, callback){
    let password = 'bujslvcdwkqthryu';
    let sender = 'kaibin.kyu@gmail.com';
    let mailServiceProvider = 'gmail';

    readHTMLFile(__dirname+'/templates/resetPassword.html',function(err, html){
        if(err){
            callback(err);
        }
        let transporter = nodemailer.createTransport({
            service: mailServiceProvider,
            auth: {
                user: sender,
                pass: password
            }
        });
        let htmlTemplate = handlebars.compile(html);
        let link = "https://my-noqubot.herokuapp.com/service/resetpassword/receivePasswordToken/" + tokenUrl;
        let replacements = {
            name: name,
            username: username,
            token: link
        };
        let htmlToSend = htmlTemplate(replacements);
        let mailOptions = {
            from: 'admin@my-noqubot.herokuapp.com',
            to: email,
            subject: 'Password Reset - my-noqubot.herokuapp.com',
            html : htmlToSend
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                // console.log(error);
                return callback(error);
            } else {
                // console.log('Email sent: ' + info.response);
                return callback(null, info);
            }
        });
    });

};


let sendPlainTextEmail = function(email,subject, text){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kaibin.kyu@gmail.com',
            pass: 'bujslvcdwkqthryu'
        }
    });

    let mailOptions = {
        from: 'kaibin.kyu@gmail.com',
        to: email,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};


module.exports = {
    sendPlainTextEmail: sendPlainTextEmail,
    sendResetPassword: sendResetPassword
};
