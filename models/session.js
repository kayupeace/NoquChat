var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
  user_id: {type: String},
  business: {
    business_id: {type: String}
    name: {type: String},
    ABN: {type: String},
    menu: []
  }
});

module.exports = mongoose.model("Session", SessionSchema);