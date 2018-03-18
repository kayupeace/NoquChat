'use strict';

var express = require('express'),
    router = express.Router();
var roomService = require(__base + 'lib/services/room');

 router.get('/', function (req, res) {
    // get list of private type room

     roomService.getPublicRoom(function (err, rooms) {
         if (err){
             //console.log(err);
             return res.status(500).send("Contact web administer for further help");
         }else{
             res.format({
                 html: function(){
                     res.render('ChatRoom/AllPublicRooms', {
                         title: 'Success',
                         rooms: rooms,
                     });
                 }
             });
         }
     });

});


module.exports = router;