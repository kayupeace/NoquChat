'use strict';

var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

var UserTable = require(__base + 'models/user.js');
var RoomTable = require(__base + 'models/room.js');
var roomService = require(__base + 'lib/services/room');

router.get('/', function (req, res) {
    // get list of private type room
    roomService.getAllRoom(function (err, rooms) {
        if (err){
             console.log(err);
        }
        res.render("roomList", {
            title: "list of room",
            rooms: rooms
        });
    });

        /**
        res.format({
            //HTML response will render the index.jade file in the views/items folder also in jade view
            html: function(){
                res.render("roomList", {
                    title: "list of room",
                    rooms: rooms
                });
            },
            //JSON response will show all items in JSON format
            json: function(){
                res.json(rooms);
            }
        });
         **/
});

router.post('/newroom', function (req, res) {
    req.sanitize('title').escape();
    req.sanitize('title').trim();
    req.sanitizeParams('roomID').escape();
    req.sanitizeParams('roomID').trim();
    req.sanitize('description').escape();
    req.sanitize('room_type').escape();
    req.sanitize('room_type').trim();

    let newRoom = RoomTable({
        room_uuid: string
        title: string
        description: string
        room_type:{
            type: String,
            enum: RoomType,
            required: true
        },
        room_owner: req.session.userId
    });
    let errors = req.validationErrors();
    if(errors){
        // re render all above data and ask user to correct incorrect filed
    }else {
        // update room table
    }




});




router.get('/:roomID/create', function(req, res){
    req.sanitize('title').escape();
    req.sanitize('title').trim();
    req.sanitizeParams('roomID').escape();
    req.sanitizeParams('roomID').trim();
    req.sanitize('description').escape();
    req.sanitize('room_type').escape();
    req.sanitize('room_type').trim();

    let errors = req.validationErrors();
    if(errors){
        // re render all above data and ask user to correct incorrect filed
    }else {
        // update room table
    }






    console.log("asdasd");
    console.log(req.params.roomID);

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