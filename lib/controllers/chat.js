'use strict';

var express = require('express'),
    router = express.Router();

var roomService = require(__base + 'lib/services/room');

router.get('/', function(req, res) {
    res.render("test/chatroom");
});

router.route('/chatroom')
    .get(function (req, res) {
        let errorMessage = req.cookies.chatRoomError;
        res.clearCookie('chatRoomError');
        if(req.cookies.chatRoom){
            //res.sendFile(__base+'public/views/chat.html');
            res.render("chat.html", {
            });
        }
        else {
            console.log("redirect to chatroom 1");
            res.render("test/chatroom",{
                error: "Sorry, We can't find your room " + errorMessage
            });
        }
    })
    .post(function (req, res) {
        req.sanitize('roomId').escape();
        req.sanitize('roomId').trim();

        let room_id = req.body.roomId;

        roomService.getMyPrivateRoom(room_id, function (err, room) {
            if (err){
                res.clearCookie('chatRoom');
                res.cookie('chatRoomError', room_id, {expire: new Date() + 9999});
                res.redirect("/user/chat/chatroom");
            }else if(!room) {
                res.clearCookie('chatRoom');
                res.cookie('chatRoomError', room_id, {expire: new Date() + 9999});
                res.redirect("/user/chat/chatroom");
            }else {
                res.clearCookie('chatRoomError');
                res.cookie('chatRoom', req.body.roomId, {expire: new Date() + 9999});
                res.redirect("/user/chat/chatroom");
            }
        });
    });

router.get('/quit', function(req, res) {
    res.clearCookie('chatRoom');
    res.send('Quit Room');
});

module.exports = router;