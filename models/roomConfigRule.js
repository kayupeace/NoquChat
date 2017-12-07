'use strick';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Room = require(__base + 'models/room.js');
// var Rule = require(__base + 'models/roomConfigType.js');
/*
*   TODO:
*       can be extended with new config rule table
*       which contain set of rules, such like timing based rule, one instance winner
*       or click to go next instance (special case which should be only allowed at
*       specialist case
*
* */

var RoomConfigRuleSchema = new Schema({
    /**
     *
        rooms: [{
            type: Schema.Types.ObjectId, ref: 'roomconfigtype',
        }],

     */
    rooms: [{
        type: Schema.Types.ObjectId, ref: 'room',
        }],
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
    owner:{
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    }
});


var ConfigSchema = mongoose.model('roomconfigrule', RoomConfigRuleSchema);

module.exports = ConfigSchema;
