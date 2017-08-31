var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


var UserSchema = new Schema({
    email: {
        type : String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
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
            })
        });
};


//hashing a password before saving it to the database

UserSchema.pre('save', function (next) {
    console.log("create hash password");
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
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
    return bcrypt.compareSync(password, user.password);
};

var User = mongoose.model('User', UserSchema);

module.exports = User;

// in mongodb, userschema is called users