'use strict';

var express = require('express'),
    router = express.Router(),
    User = require(__base + 'models/user.js');

var RoomConfigRuleTable = require(__base + 'models/roomConfigRule.js');

// select existing list of room with this configration set up .......
router.route('/newconfig')
    .get(function (req, res) {
        let title = "Create My Config file";
        let action = "/user/config/newconfig";
        res.render("ChatRoom/Config/newConfig", {
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
                    return res.redirect('/user/room');
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
                        res.render("ChatRoom/Config/configUpdate", {
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
                                return res.redirect('/user/room');
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
                        return res.redirect('/user/room');
                    }
                });
        }
    });


module.exports = router;