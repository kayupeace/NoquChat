var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Business = require('../models/business.js');
/* GET /business listing. */
router.get('/', function(req, res, next) {
  Business.find(function (err, businesses) {
    if (err) return next(err);
    res.json(businesses);
  });
});

module.exports = router;