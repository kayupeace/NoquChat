'use strict';

var sendMail = function(req, res, next){
    //console.log("POST: Send email");

    var mailMessager = req.body.mailMessager;
    var mailSubject = "My Email Title";
    if(!mailMessager){
        mailMessager = "Default content";
    }

    var api_key = 'key-6c67b8f43774604b1bfd646d113b8d04';
    var domain = 'sandbox3b285d7e9944419a8d4a2db96cf51e48.mailgun.org';
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

    var data = {
        from: 'kayu6150@uni.sydney.edu.au',
        to: 'kayupeace@gmail.com',
        subject: mailSubject,
        text: mailMessager
    };

    mailgun.messages().send(data, function (error, body) {
        console.log(body);
    });

};

module.exports = {
    sendMail: sendMail
};