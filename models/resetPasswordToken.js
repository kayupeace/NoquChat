'use strick';

/**
 *
 * @type {*|Mongoose}
 *
 *  Number of confirm used for to check number of email user send when token not expired
 *  once the user confirm  too much email (3 times), we should not send email 9
 *
 */

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = require(__base + 'models/user.js');
const oneDay = 1000 * 60 * 60 * 24 * 1;

/*  0. not reset password  1. reset password */
let done = {
    values: [0,1],
};

let restPasswordSchema = new Schema({
    token: {
        type : String,
        unique : true,
        trim: true
    },
    create_at: {
        type: Date,
        default: Date.now,
        min: new Date('1900-1-1')
        //max: new Date()
    },
    expired_at: {
        type: Date,
        default: Date.now() + oneDay * 10,
        min: new Date('1900-1-1')
        //max: new Date()
    },
    done:{
        type: Number,
        enum: done,
        required: true,
        min: 0,
        max: 1
    },
    numberOfConfirm: {
        type: Number,
        default: 1,
        required: true,
        min: 0,
        max: 3
    },
    owner:{
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    }
});

let RestPasswordToken = mongoose.model('resetPassword', restPasswordSchema);

module.exports = RestPasswordToken;
