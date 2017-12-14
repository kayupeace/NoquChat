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

let getMyPrivateRoom = function(room_uuid, next){
    console.log("try to search: " + room_uuid);
    RoomTable
        .findOne({room_type : "Private", room_uuid: room_uuid}, function(err, room) {
            if (err) {
                console.log(err.message);
                return(err)
            } else if(!room ){
                console.log("Room is not exist at my private room");
            }
            return next(null, room);
        })
};

module.exports = {
    getAllRoom: getAllRoom,
    getPublicRoom: getPublicRoom,
    getPrivateRoom: getPrivateRoom,
    getMyPrivateRoom: getMyPrivateRoom
};
