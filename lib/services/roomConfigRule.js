'use strict';
var RoomConfigRule = require(__base + 'models/roomConfigRule.js')

let getAllRoomConfig = function(next){
    RoomConfigRule
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

module.exports = {
    getAllRoomConfig: getAllRoomConfig
};
