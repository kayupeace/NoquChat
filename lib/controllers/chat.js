'use strict';

var express = require('express'),
    router = express.Router();

router.get('/', function(req, res) {
    res.render("test/chatroom");
});

router.route('/chatroom')
    .get(function (req, res) {
        console.log("Cookies :  ", req.cookies.chatRoom);
        res.sendFile(__base+'public/views/chat.html');
    })
    .post(function (req, res) {
        req.sanitize('roomId').escape();
        req.sanitize('roomId').trim();

        res.cookie('chatRoom',req.body.roomId, {expire : new Date() + 9999});
        res.redirect("/user/chat/chatroom");
    });

router.get('/quit', function(req, res) {
    clearCookie('chat');
    res.send('Quit Room');
});

module.exports = router;