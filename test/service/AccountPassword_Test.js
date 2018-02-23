var assert = require('assert');
global.__base = '../../';

var AccontPassword = require("../../lib/services/AccountPassword.js");
var User = require('../../models/user.js');

describe('Account Password', function() {
    var UserSchema = {
        email: "test@gmail.com",
        username: "test",
        password: "test"
    };
    let User_id;
    // set up

    before(function(done){
        User.create(UserSchema, function(err, user){
            if(err){
                done(err);
            }else{
                User_id = user._id;
                done();
            }
        });
    });

    after(function(done) {
        User.remove({_id: User_id},function (err) {
            if(err){
                done(err);
            }else{
                done();
            }
        })
    });

    describe('#Check Password is the same', function () {
        //set up
    });

    describe('#Update Password', function () {

    });
    


});