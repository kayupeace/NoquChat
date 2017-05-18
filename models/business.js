var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BusinessSchema = new Schema({
  user_id: {type: String},
  name: {type: String},
  ABN: {type: String}
});

module.exports = mongoose.model("Business", BusinessSchema);