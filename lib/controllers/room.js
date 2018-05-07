'use strict';

var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

var ShortId = require('shortid');

var RoomTable = require(__base + 'models/room.js');
var RoomConfigRuleTable = require(__base + 'models/roomConfigRule.js');
var roomService = require(__base + 'lib/services/room');
var RoomConfigRuleService = require(__base + 'lib/services/roomConfigRule');
var async = require("async");

router.get('/', function (req, res) {
    let owner_id = req.session.userId;
    async.parallel([
            function findRoomConfig (callback) {
                RoomConfigRuleService.getMyRoomConfig(owner_id, function (err, config) {
                    if (err){
                        return callback(err);   // error, navigate to error page.
                    }
                    return callback(null, config);
                })
            },
            function findRoom(callback) {
                roomService.getAllMyRoom(owner_id,function (err, rooms) {
                    if (err){
                        return callback(err);
                    }
                    return callback(null, rooms);
                });
            }
        ],
        function (err, result) {
            //var data = JSON.stringify(result);
            console.log(result[0]);
            console.log("\n\n\n\n");
            console.log(result[1]);

            if(err){
                //return next(err);
                return res.status(500).send("Server is under maintain");
            }else {
                res.format({
                    html: function(){
                        res.render('ChatRoom/RoomAndConfigList', {
                            title: 'My Room & Config',
                            configs: result[0],
                            rooms: result[1],
                        });
                    }
                });
            }
        }
    );

});

router.route('/newroom')
    .get(function (req, res) {

        let title = "Create My New Room";
        let action = "/user/room/newroom";
        res.render("ChatRoom/Room/newRoom", {
            title: title,
            action: action,
            room:''
        });

    })
    .post(function (req, res){
        req.sanitize('title').escape();
        req.sanitize('title').trim();
        req.sanitize('description').escape();
        req.sanitize('room_type').escape();
        req.sanitize('room_type').trim();

        let newRoom = RoomTable({
            room_uuid: ShortId.generate(),
            title: req.body.title,
            description: req.body.description,
            room_type: req.body.room_type,
            room_owner: req.session.userId
        });
        let errors = req.validationErrors();
        if(errors){
            console.log(errors);
            // re render all above data and ask user to correct incorrect filed
        }else {
            console.log(newRoom);
            RoomTable.create(newRoom, function(err, user){
                if (err || user == null){
                    //return next(err)
                    return res.status(500).send("Unable to Create User Table, either username, email are exist");
                    //return res.status(500).send(err);
                }else{
                    //res.status(200).send(user);
                    console.log("successful create room\n");
                    return res.redirect('/user/room');
                }
            });
        }

    });

router.route('/:roomID/edit')
    .get(function(req, res){
        let title = "Update My New Room";
        let action = "/user/room/"+ req.params.roomID + "/edit";
        req.sanitizeParams('roomID').escape();
        req.sanitizeParams('roomID').trim();
        let errors = req.validationErrors();

        if(errors){
            // re render all above data and ask user to correct incorrect filed
            console.log(err);
        }else {
            async.parallel([
                function findAllMyConfig(callback) {
                    console.log("first");
                    RoomConfigRuleTable.find({owner: req.session.userId}, '_id title description')
                        .exec(function (err, configs) {
                            if(err){
                                console.log("err");
                                return callback(err);
                            }else{
                                return callback(null, configs);
                            }
                        });
                },
                function findMyRoom(callback) {
                    console.log("second");
                    RoomTable.findOne({
                        _id : req.params.roomID,
                        room_owner : req.session.userId
                    })//, function (err, room) {
                        .populate('room_config')
                        .exec(function (err, room) {
                            if(err){
                                return callback(err);
                            }else if(room == null){
                                var error = new Error('Room does not exist');
                                error.status = 404;
                                return callback(error);
                            }else {
                                console.log("find room \n" + room);
                                return callback(null, room);
                            }
                        })
                }
            ],
                function(err, result){
                    console.log(err);
                    if(err || result == null){
                        return res.status(500).send("Can not find room, checkout later");
                    }else {
                        let configs = result[0];
                        console.log("my stirng asdasdasdasdasdas");
                        console.log(configs);
                        let room = result[1];
                        res.render("ChatRoom/Room/editRoom", {
                            configs: configs,
                            room: room,
                            title: title,
                            action: action
                        });
                    }

                });
        }

    })
    .post(function(req, res){
        let title = "Update My New Room";

        req.sanitize('title').escape();
        req.sanitize('title').trim();
        req.sanitizeParams('roomID').escape();
        req.sanitizeParams('roomID').trim();
        req.sanitize('description').escape();
        req.sanitize('room_type').escape();
        req.sanitize('room_type').trim();
        req.sanitize('room_config').escape();
        req.sanitize('room_config').trim();

        let updateRoom = {
            title: req.body.title,
            description: req.body.description,
            room_type: req.body.room_type,
            room_config: req.body.room_config
        };


        let errors = req.validationErrors();
        if(errors){
            // re render all above data and ask user to correct incorrect filed
            console.log(err);
        }else {

            console.log(updateRoom);

            RoomTable.findOne({
                _id : req.params.roomID,
                room_owner : req.session.userId
            })
                .exec(function (err, room) {
                    if(err || room == null){
                        console.log(err.message);
                        return res.status(500).send("can not find room, checkout later");
                    }else {
                        console.log("err 1");
                        console.log(room);

                        // remove room_config with room id

                        room.title = updateRoom.title;
                        room.description = updateRoom.description;
                        room.room_type = updateRoom.room_type;
                        if( updateRoom.room_config ) {
                            room.room_config = updateRoom.room_config;
                        }
                        console.log("err2");
                        room.save(function (err) {
                            if (err) {
                                console.log("err3");
                                console.log(err.message);
                            }
                            else {
                                console.log("asdasd");
                                console.log(req.params.roomID);
                                //action =
                                return res.redirect('/user/room');
                            }
                        });
                    }

                })

        }
    });


router.route('/:roomID/delete')
    .post(function(req, res){
        req.sanitizeParams('roomID').escape();
        req.sanitizeParams('roomID').trim();

        let room_id = req.params.roomID;
        let user_id = req.session.userId;

        let errors = req.validationErrors();
        if(errors){
            // re render all above data and ask user to correct incorrect filed
            console.log(err);
        }else {
            RoomTable.findOneAndRemove({
                _id: req.params.roomID,
                room_owner: req.session.userId
            })
                .exec(function (err, room) {
                    if(err || room == null){
                        return res.status(500).send("Can not find room, checkout later");
                    }else{
                        return res.redirect('/user/room');
                    }
                });
        }
    });


module.exports = router;
