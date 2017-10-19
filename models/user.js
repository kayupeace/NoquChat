var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// if email specified with index, to modify index with spare to true,
// you need
//  db.users.dropIndex("email": 1)
//  db.users.createIndex({ "email":1},{unique:true, sparse:true})
// without index, just tye second command, otherwise,  plz refer to link:
// https://docs.mongodb.com/v3.0/tutorial/modify-an-index/
// https://docs.mongodb.com/v3.2/core/index-sparse/

// sparse only work with table without the filed email,
// does not work if filed contain same
var UserSchema = new Schema({
    email: {
        type : String,
        trim: true,
        index: true,
        unique: true,
        sparse: true //ensure
        //required: true,
    },
    username: {
        type: String,
        unique: false,  // db.users.dropIndex({"username":3})
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});


//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email })
        .exec(function (err, user) {
            if (err) {
                console.log("error");
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                console.log("user not found");
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    console.log("valid");
                    return callback(null, user);
                } else {
                    console.log("invalid pass");
                    return callback();
                }
            });
        });
};


//hashing a password before saving it to the database

UserSchema.pre('save', function (next) {
    'use strict';
    console.log("create hash password");
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

// Notices that findoneandupdate ignore my pre middleware,
// seems like the function directly excute the code inside database
/**
UserSchema.pre('update', function (next) {
    console.log("Updater database");
    var user = this;
    next();
});
 **/

// Verify Password
UserSchema.methods.verifyPassword = function(user, password) {
    'use strict';
    return bcrypt.compareSync(password, user.password);
};

UserSchema.methods.resetPassword = function (user, password) {
    'use strict';
    console.log("Reset Password to: " + password);
    user.password = password;
    user.save();
};

var User = mongoose.model('User', UserSchema);

module.exports = User;

// in mongodb, userschema is called users