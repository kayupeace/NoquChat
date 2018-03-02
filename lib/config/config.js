'use strict';
// var config = require('./config.js').get(process.env.NODE_ENV);
// export NODE_ENV=production
var config = {
    production: {
        session: {
            key: 'the.express.session.id',
            secret: 'something.super.secret'
        },
        database: process.env.MONGODB_URI,
        facebook: {
            clientID: '308674396274436',
            clientSecret: 'fa25957faf73ae4d94f7605f73ea23f0',
            callbackURL: "https://my-noqubot.herokuapp.com/auth/facebook/callback"
        },
        mailgun: {
            apiKey: 'key-6c67b8f43774604b1bfd646d113b8d04',
            domain: 'sandbox3b285d7e9944419a8d4a2db96cf51e48.mailgun.org',
        },
        cloudfront: "https://d1b5akm6b24w7k.cloudfront.net/"
    },
    staging: {
        session: {
            key: 'the.express.session.id',
            secret: 'something.super.secret'
        },
        database: 'mongodb://mongo:27017/noqubot',
        facebook: {
            clientID: '114900112522034',
            clientSecret: 'f48205e43fc951ba53544878925c6247',
            callbackURL: "http://localhost:5000/auth/facebook/callback"
        },
        mailgun: {
            //apiKey: 'key-6c67b8f43774604b1bfd646d113b8d04',
            //domain: 'sandbox3b285d7e9944419a8d4a2db96cf51e48.mailgun.org',
            apiKey: null,
            domain: null
        },
        cloudfront: "https://d1b5akm6b24w7k.cloudfront.net/"
    },
    default: {
        session: {
            key: 'the.express.session.id',
            secret: 'something.super.secret'
        },
        database: 'mongodb://localhost/noqubot',
        facebook: {
            clientID: '114900112522034',
            clientSecret: 'f48205e43fc951ba53544878925c6247',
            callbackURL: "http://localhost:5000/auth/facebook/callback"
        },
        mailgun: {
            //apiKey: 'key-6c67b8f43774604b1bfd646d113b8d04',
            //domain: 'sandbox3b285d7e9944419a8d4a2db96cf51e48.mailgun.org',
            apiKey: null,
            domain: null
        },
        cloudfront: "https://d1b5akm6b24w7k.cloudfront.net/"
    }
};

exports.get = function get(env) {
    return config[env] || config.default || config.staging;
};