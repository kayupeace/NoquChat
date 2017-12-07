'use strick';

/**
 *
 * @type {*|Mongoose}
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require(__base + 'models/user.js');
var config = require(__base + 'models/roomConfigRule.js');

/*  1. Timed  2. OneWinner  3. Nolimit*/
var RoomType = {
    values: ['Public', 'Private'],
    message: 'Plz choose existing type'  //error message  mongoose Custom Validators
};

var roomSchema = new Schema({
    // primary id will be auto generate
    /**  open_sesame
    player_list: [{   // to match with user table, extension for user with account and keep historical record
        type : String,
        unique: true,
        trim: true
    }],
     **/
    room_uuid: {
        type : String,
        unique : true,
        trim: true
    },
    title: {
        type : String,
        trim: true
    },
    description: {
        type : String
    },
    create_at: {
        type: Date,
        default: Date.now,
        min: new Date('1900-1-1')
        //max: new Date()
    },
    room_type:{
        type: String,
        enum: RoomType,
        required: true
    },
    room_owner:{
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    room_cofig:{
        type: Schema.Types.ObjectId, ref: 'roomconfigrule'
    }
});

var Room = mongoose.model('room', roomSchema);

module.exports = Room;
