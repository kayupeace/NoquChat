'use strict';

var express = require('express'),
    router = express.Router();

router.get('/', function(req, res) {
    res.sendFile(__base+'public/views/vueExample.html');
});

module.exports = router;