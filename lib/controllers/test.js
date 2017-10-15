'use strict';
var express = require('express'),
    router = express.Router();

var async = require("async");
var asyncf = require('asyncawait/async');
var await = require('asyncawait/await');



var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    multer = require('multer'),
    fs = require('fs'),
    AWS = require('aws-sdk'),
    User = require(__base + 'models/user.js'),
    UserProfile = require(__base + 'models/userProfile.js');

/**
 *
 *  form(action='/assets/#{item._id}/edit',method='post',enctype='application/x-www-form-urlencoded')
 *
 * // Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
 router.use(bodyParser.urlencoded({ extended: true }));
 router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));
 **/




var kevin =0;
var start = new Date();

function slowFunction3(lll){
    setTimeout(function() {
        var d = new Date();
        console.log("slow function 3: " + (d.getTime()-start.getTime()));
        console.log(lll+2);
        return lll+2;
    }, 1000);
}

function fastFunction3(a){
    return new Promise( resolve => {
        setTimeout(() => {
            var d = new Date();
            console.log("\n asynchronous await function");
            console.log("quick function 3: " + (d.getTime() - start.getTime()));
            console.log(a + 1);
            resolve(a+1);
        }, 4000);
    });
}
var myAwait = asyncf (function () {
    var b = await (fastFunction3(1));
    var a = await (slowFunction3(b));
});


router.get('', function(req, res, next) {
    start = new Date();
    var d = new Date();


    /** total runing time 3000
    async.parallel([
            function (callback) {
                setTimeout(function () {
                    var d = new Date();
                    console.log('First Step --> : ' + (d.getTime() - start.getTime()));
                    callback(null, '1');
                }, 3000);
            },
            function (callback) {
                var d = new Date();
                console.log('Second Step --> : ' + (d.getTime() - start.getTime()));
                callback(null, '2');
            },
            function (callback) {
                setTimeout(function () {
                    var d = new Date();
                    console.log('Thrid Step --> ' + (d.getTime() - start.getTime()));
                    callback(null, '3');
                }, 1000);
            }
        ],
        function (err, result) {
            var d = new Date();
            console.log(result + " : "+ (d.getTime() - start.getTime()));
        });
    **/

     async.auto({
        get_data: function(callback) {
            setTimeout(function () {
                var d = new Date();
                console.log('in get_data --> : ' + (d.getTime() - start.getTime()));
                callback(null, 'data', 'converted to array');
            }, 3000);
        },
        make_folder: function(callback) {
            setTimeout(function () {
                var d = new Date();
                console.log('in make_folder --> ' + (d.getTime() - start.getTime()));
                callback(null, 'folder');
            }, 1000);
        },
        write_file: ['get_data', 'make_folder', function(results, callback) {
            console.log('in write_file', JSON.stringify(results));
            // once there is some data and the directory exists,
            // write the data to a file in the directory
            callback(null, 'filename');
        }],
        email_link: ['write_file', function(results, callback) {
            console.log('in email_link', JSON.stringify(results));
            // once the file is written let's email a link to it...
            // results.write_file contains the filename returned by write_file.
            callback(null, {'file':results.write_file, 'email':'user@example.com'});
        }]
    }, function(err, results) {
        console.log('err = ', err);
        console.log('results = ', results);
    });

    /**
     async.auto({
        get_data: function(callback) {
            console.log('in get_data');
            // async code to get some data
            callback(null, 'data', 'converted to array');
        },
        make_folder: function(callback) {
            console.log('in make_folder');
            // async code to create a directory to store a file in
            // this is run at the same time as getting the data
            callback(null, 'folder');
        },
        write_file: ['get_data', 'make_folder', function(results, callback) {
            console.log('in write_file', JSON.stringify(results));
            // once there is some data and the directory exists,
            // write the data to a file in the directory
            callback(null, 'filename');
        }],
        email_link: ['write_file', function(results, callback) {
            console.log('in email_link', JSON.stringify(results));
            // once the file is written let's email a link to it...
            // results.write_file contains the filename returned by write_file.
            callback(null, {'file':results.write_file, 'email':'user@example.com'});
        }]
    }, function(err, results) {
        console.log('err = ', err);
        console.log('results = ', results);
    });
     **/

    /** Total running time is 4007,
    async.waterfall([
            function (callback) {
                setTimeout(function () {
                    var d = new Date();
                    console.log('First Step --> '+ (d.getTime() - start.getTime()));
                    callback(null, 1);
                }, 3000);
            },
            function (arg,callback) {
                var d = new Date();
                console.log('Second Step --> ' + arg + " : "+ (d.getTime() - start.getTime()));

                callback(null, '2');
            },
            function (arg, callback) {
                setTimeout(function () {
                    var d = new Date();
                    console.log('Thrid Step --> '+arg+ " : "+ (d.getTime() - start.getTime()));
                    callback(null, '3');
                }, 1000);
            }
        ],
        function (err, result) {
            var d = new Date();
            console.log(result+ " : "+ (d.getTime() - start.getTime()));
        });
    **/
    /**
    async.series([
            function (callback) {
                setTimeout(function () {
                    var d = new Date();
                    console.log('First Step --> '+ (d.getTime() - start.getTime()));
                    callback(null, 1);
                }, 3000);
            },
            function (callback) {
                var d = new Date();
                console.log('Second Step --> '+ (d.getTime() - start.getTime()));

                callback(null, '2');
            },
            function ( callback) {
                setTimeout(function () {
                    var d = new Date();
                    console.log('Thrid Step --> '+ (d.getTime() - start.getTime()));
                    callback(null, '3');
                }, 1000);
            }
        ],
        function (err, result) {
            var d = new Date();
            console.log(result+" : "+ (d.getTime() - start.getTime()));
        });
    **/


    console.log('Program End');

    //console.log(d.getTime());

    //myAwait();
    // if run normally, fast run at 1000, slow run at 4000; run parallel

    res.format({
        html: function () {
            res.render('test', {
                title: 'test'
            });
        }
    });

});

module.exports = router;