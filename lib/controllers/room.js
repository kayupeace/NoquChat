'use strict';

var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

var UserTable = require(__base + 'models/user.js');
var RoomTable = require(__base + 'models/room.js');

router.get('/', function (req, res) {
    // get list of private type room

    RoomTable
    //.find({room_type : "Private"}, function(err, rooms) {
        .find({}, function(err, rooms) {
        if (err) {
            console.log(err.message);
        }
        // object of all the users

        RoomTable
            .find({room_type : "Private"})
            .populate('room_owner')
            .exec(function(err, users){
                if (err){
                    console.log(err.message)
                }
                for(var user of users){
                    console.log(user.room_owner)
                }
        });

        res.render("roomList", {
            title: "list of room",
            rooms: rooms
        });
    });



});

router.post('/', function(req, res){
    console.log("POST: Create New User");
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    var checkEmail = isvalidEmail(email);
    var checkusername = isvalidString(username);
    var checkpassword = isvalidString(password);

    console.error("---------   Create User   ---------" );

    if (!checkEmail || !checkusername || !checkpassword){  //if one of them are not valid which return true
        var errorMessage = "";
        if(!checkEmail){
            errorMessage += "Email ,";
        }
        if(!checkusername){
            errorMessage += "user name ,";
        }
        if(!checkpassword){
            errorMessage += 'password ,';
        }
        console.error("Error: " + errorMessage + " are not in correct format");
        req.session.error = ("Error: " + errorMessage + " are not in correct format");
        return res.redirect('registration');
    } else {
        console.log( "   email: " + email + "\n" + "   username: " + username + "\n   password: "+password);
        var userData = {
            email: email,
            username: username,
            password: password
        };

        User.create(userData, function(err, user){
            if (err){
                //return next(err)
                return res.status(500).send("Unable to Create User Table, either username, email are exist");
                //return res.status(500).send(err);
            }else{
                //res.status(200).send(user);
                console.log("successful create user\n");
                //req.session.cookie.expires = false;
                req.session.userId = user._id; //store user session ID
                return res.redirect('/');
            }
        });
    }
});

module.exports = router;

/**
 var newRoom = RoomTable({
            room_uuid: "aaaa",
            title: "asdasd",
            room_type: "Public",
            room_owner: req.session.userId
        });
 var newRoom2 = RoomTable({
        room_uuid: "bbbb",
        title: "asdasd",
        room_type: "Public",
        room_owner: req.session.userId
    });

 var newRoom3 = RoomTable({
        room_uuid: "vvvv",
        title: "asdasd",
        room_type: "Public",
        room_owner: req.session.userId
    });
 newRoom.save(function (err) {
            if (err) throw err;
            console.log('User created!');
        });
 newRoom2.save(function (err) {
        if (err) throw err;
        console.log('User created!');
    });

 newRoom3.save(function (err) {
        if (err) throw err;
        console.log('User created!');
    });
 **/