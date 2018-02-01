'use strict';

var isLogin = require('../middlewares/LoginState').isRequire;
var express = require('express'),
    router = express.Router();

var userAccount = require("../controllers/user2");
var room = require("../controllers/room");
var config = require("../controllers/roomConfig");
var allPublicRoom = require("../controllers/allPublicRoom");
var chat = require("../controllers/chat");
var vueExample = require("../controllers/vueExample");


router.use('/chat', chat);
router.use('/vueExample', vueExample);
router.use('/', isLogin, userAccount);  // need fix with style
//islogin will be checked also below
router.use('/room', room);
router.use('/config', config);
router.use('/allRooms', allPublicRoom);

module.exports = router;