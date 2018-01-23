'use strict';

var express = require('express'),
    router = express.Router();

var roomService = require(__base + 'lib/services/room');

router.get('/', function(req, res) {
    if(req.cookies.chatRoom){
        res.redirect("/user/chat/chatroom");
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
        let errorMessage = req.cookies.chatRoomError;
        res.clearCookie('chatRoomError');
        if(req.cookies.chatRoom){
            //res.sendFile(__base+'public/views/chat.html');
            res.format({
                html: function(){
                    res.render('chat.html', {
                    });
                }
            });
        }
        else {
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