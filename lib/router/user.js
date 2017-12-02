'use strict';

var isLogin = require('../middlewares/LoginState').isRequire;
var express = require('express'),
    router = express.Router();

var userAccount = require("../controllers/user");
var room = require("../controllers/room");

router.use('/', isLogin, userAccount);  // need fix with style
//islogin will be checked also below
router.use('/room', room);

module.exports = router;