'use strict';

var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

var ShortId = require('shortid');

var RoomConfigRuleTable = require(__base + 'models/roomConfigRule.js');
var RoomConfigRuleService = require(__base + 'lib/services/roomConfigRule');
var roomService = require(__base + 'lib/services/room');
var async = require("async");

var UserTable = require(__base + 'models/user.js');
var RoomTable = require(__base + 'models/room.js');
var ShortId = require('shortid');
/**
var UserTable = require(__base + 'models/user.js');
var RoomTable = require(__base + 'models/room.js');
var roomService = require(__base + 'lib/services/room');
 **/
//var roomService = require(__base + 'lib/services/room');

router.get('/', function (req, res) {
    // get list of private type room

    async.parallel([
            function findRoomConfig (callback) {
                RoomConfigRuleService.getAllRoomConfig(function (err, config) {
                    if (err){
                        console.log(err.message);
                        return callback(err);   // error, navigate to error page.
                    }
                    return callback(null, config);
                });
            },
            function findRoom(callback) {
                roomService.getAllRoom(function (err, rooms) {
                    if (err){
                        //console.log(err);
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
                        res.render('roomConfig/configList', {
                            title: 'Success',
                            configs: result[0],
                            rooms: result[1],
                        });
                    }
                });
            }

        });

    /**

    res.render("roomConfig/configList", {
        title: "list of room",
        assets: config
    });

     **/

});

// select existing list of room with this configration set up .......
router.route('/newconfig')
    .get(function (req, res) {
        let title = "Create My Config file";
        let action = "/user/config/newconfig";
        res.render("roomConfig/newConfig", {
            title: title,
            action: action
        });

    })
    .post(function (req, res){
        req.sanitize('title').escape();
        req.sanitize('title').trim();
        req.sanitize('description').escape();

        let newConfig = RoomConfigRuleTable({
            title: req.body.title,
            description: req.body.description,
            owner: req.session.userId
        });
        let errors = req.validationErrors();
        if(errors){
            console.log(errors);
            // re render all above data and ask user to correct incorrect filed
        }else {
            console.log(newConfig);
            RoomConfigRuleTable.create(newConfig, function(err, config){
                if (err || config == null){
                    return res.status(500).send("Unable to Create Config Rule Table");
                }else{
                    console.log("successful create config\n");
                    return res.redirect('/user/config');
                }
            });
        }

    });



router.route('/:configID/edit')
    .get(function(req, res){
        let title = "Update My Config";
        let action = "/user/config/"+ req.params.configID + "/edit";
        req.sanitizeParams('configID').escape();
        req.sanitizeParams('configID').trim();
        let errors = req.validationErrors();

        if(errors){
            // re render all above data and ask user to correct incorrect filed
            console.log(err);
        }else {
            RoomConfigRuleTable.findOne({
                _id : req.params.configID,
                owner : req.session.userId
            })//, function (err, room) {
                .exec(function (err, config) {
                    if(err || config == null){
                        //console.log(err.message);
                        return res.status(500).send("Can not find room config, checkout later");
                    }else {
                        //console.log("find room \n" + config);
                        res.render("roomConfig/configUpdate", {
                            asset: config,
                            title: title,
                            action: action,
                        });
                    }
                })
        }

    })
    .post(function(req, res){
        req.sanitize('title').escape();
        req.sanitize('title').trim();
        req.sanitizeParams('configID').escape();
        req.sanitizeParams('configID').trim();
        req.sanitize('description').escape();

        let updateRoom = {
            title: req.body.title,
            description: req.body.description,
        };

        let errors = req.validationErrors();
        if(errors){
            // re render all above data and ask user to correct incorrect filed
            console.log(err);
        }else {

            RoomConfigRuleTable.findOne({
                _id : req.params.configID,
                owner : req.session.userId
            })
                .exec(function (err, config) {
                    if(err || config == null){
                        console.log(err.message);
                        return res.status(500).send("can not find config, checkout later");
                    }else {
                        config.title = updateRoom.title;
                        config.description = updateRoom.description;
                        config.save(function (err) {
                            if (err) {
                                //console.log("err3");
                                console.log(err.message);
                            }
                            else {
                                //console.log("asdasd");
                                //console.log(req.params.configID);
                                //action =
                                return res.redirect('/user/config');
                            }
                        });
                    }

                })

        }
    });


router.route('/:configID/delete')
    .post(function(req, res){
        req.sanitizeParams('configID').escape();
        req.sanitizeParams('configID').trim();

        let room_id = req.params.configID;
        let user_id = req.session.userId;

        let errors = req.validationErrors();
        if(errors){
            // re render all above data and ask user to correct incorrect filed
            //console.log(err);
            return res.status(500).send("Can not delete config, checkout later");
        }else {
            RoomConfigRuleTable.findOneAndRemove({
                _id: room_id,
                owner: user_id
            })
                .exec(function (err, config) {
                    if(err || config == null){
                        //console.log(err.message);
                        return res.status(500).send("Can not find config, checkout later");
                    }else{
                        return res.redirect('/user/config');
                    }
                });
        }
    });


module.exports = router;