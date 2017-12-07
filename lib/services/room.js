'use strict';
let RoomTable = require(__base + 'models/room.js');

let getAllRoom = function(next){
    RoomTable
        .find({})
        .sort({create_at: "desc"})
        .exec(function(err, rooms) {
            if (err) {
                console.log(err.message);
                return(err)
            }
            return next(null, rooms);
        })
};

let getPublicRoom = function(next){
    RoomTable
        .find({room_type : "Public"}, function(err, rooms) {
            if (err) {
                console.log(err.message);
                return(err)
            }
            return next(null, rooms);
        })
};

let getPrivateRoom = function(next){
    RoomTable
        .find({room_type : "Private"}, function(err, rooms) {
            if (err) {
                console.log(err.message);
                return(err)
            }
            return next(null, rooms);
        })
};

module.exports = {
    getAllRoom: getAllRoom,
    getPublicRoom: getPublicRoom,
    getPrivateRoom: getPrivateRoom
};
