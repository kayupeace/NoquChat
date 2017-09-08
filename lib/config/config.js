// var config = require('./config.js').get(process.env.NODE_ENV);
// export NODE_ENV=production
var config = {
    production: {
        session: {
            key: 'the.express.session.id',
            secret: 'something.super.secret'
        },
        database: 'process.env.MONGODB_URI',
        facebook: {
            clientID: '308674396274436',
            clientSecret: 'fa25957faf73ae4d94f7605f73ea23f0',
            callbackURL: "https://noqubot.herokuapp.com/auth/facebook/callback"
        }
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
        }
    }
};

exports.get = function get(env) {
    return config[env] || config.default;
};