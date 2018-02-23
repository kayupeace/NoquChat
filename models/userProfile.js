'use strick';

/**
 *
 * This is extend table from user table, which seperated user information
 * and account information, if required, plz just update user information
 * table
 *
 * @type {*|Mongoose}
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var GenderType = {
    values: ['Female', 'Male', 'Other'],
    message: 'only choose female, male, or other for gender'  //error message  mongoose Custom Validators
};

var profileSchema = new Schema({
    patron_id: {   // to match with user table, one to one relation
        type : String,
        unique: true,
        required: true,
        trim: true
    },
    imagePath: {
        type : String,
        trim: true
    },
    imagePublicId: {
        type : String,
        trim: true
    },
    DOB: {
        type: Date,
        default: Date.now,
        min: new Date('1900-1-1')
        //max: new Date()
    },
    gender:{
        type: String,
        enum: GenderType
    }
});

var userProfile = mongoose.model('userProfile', profileSchema);

module.exports = userProfile;


/**
User Profile
*                  - Image Path
*                  - Date of Birth
*                  - Gender
*                  - About
*                  - Location

 **/