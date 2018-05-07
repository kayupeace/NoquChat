'use strict';

let express = require('express'),
    router = express.Router();

let resetPassword = require("../controllers/resetPasswordByEmail");

router.use('/resetPassword', resetPassword);

module.exports = router;