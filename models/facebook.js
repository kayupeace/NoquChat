var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FacebookSchema = new Schema({
    patron_id: {
        type : String,
        unique: true,
        required: true,
        trim: true
    },
    facebook_id: {
        type: String,
        unique: true,
        required: true
    }
});

var Facebook = mongoose.model('Facebook_account', FacebookSchema);

module.exports = Facebook;

