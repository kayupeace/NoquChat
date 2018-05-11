'use strict';

let express = require('express'),
    router = express.Router();

let refreshToken = require("../controllers/refreshToken");

router.use('/refreshToken', refreshToken);

module.exports = router;