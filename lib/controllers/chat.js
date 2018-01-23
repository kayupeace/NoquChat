'use strict';

var express = require('express'),
    router = express.Router();

var roomService = require(__base + 'lib/services/room');

router.get('/', function(req, res) {
    let errorMessage = req.cookies.chatRoomError;
    if(req.cookies.chatRoom && !errorMessage){
        roomService.getMyPrivateRoom(req.cookies.chatRoom, function (err, room) {
            if (err){
                res.clearCookie('chatRoom');
                res.render("test/chatroom");
            }else if(!room) {
                res.clearCookie('chatRoom');
                res.render("test/chatroom");
            }else {
                res.redirect("/user/chat/chatroom");
            }
        });
    }else{
        res.render("test/chatroom");
    }
});


/**
 *
 * GET:
 *      if room exist in cookies
 *          render chat.html
 *      else
 *          render chatroom with error message
 *
 * POST:
 *      check room id is exist in database
 *      if exist
 *          clear previous chat room id in cookies
 *          set res cookies with room id and expire date
 *      if not exist
 *          clear previous chat room id in cookies
 *          set res cookies with room error message and expire date
 *      if error
 *          clear previous chat room id in cookies
 *          set res cookies with room error message and expire date
 *
 */

router.route('/chatroom')
    .get(function (req, res) {
        //check if game room is valid  then enter the nick name page

        let errorMessage = req.cookies.chatRoomError;
        res.clearCookie('chatRoomError');
        //if(req.cookies.chatRoom){
        if(!errorMessage){
            //res.sendFile(__base+'public/views/chat.html');
            if(req.cookies.chatRoom){
                roomService.getMyPrivateRoom(req.cookies.chatRoom, function (err, room) {
                    if (err){
                        res.clearCookie('chatRoom');
                        res.cookie('chatRoomError', req.cookies.chatRoom, {expire: new Date() + 9999});
                        res.redirect("/user/chat/chatroom");
                    }else if(!room) {
                        res.clearCookie('chatRoom');
                        res.cookie('chatRoomError', req.cookies.chatRoom, {expire: new Date() + 9999});
                        res.redirect("/user/chat/chatroom");
                    }else {
                        res.clearCookie('chatRoomError');
                        res.format({
                            html: function(){
                                res.render('chat.html', {
                                });
                            }
                        });
                    }
                });
            }
        }
        else {
            res.clearCookie('charRoom');
            res.render("test/chatroom",{
                error: "Sorry, We can't find your room \n" + errorMessage
            });
        }
    })
    .post(function (req, res) {
        req.sanitize('roomId').escape();
        req.sanitize('roomId').trim();

        let room_id = req.body.roomId;
        console.log("POST: /user/chat/chatroom  set room to" + room_id);
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