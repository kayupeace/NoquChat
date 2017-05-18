var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BusinessSchema = new Schema({
  business_id: {type: String},
  name: {type: String},
  ABN: {type: String},
  menu: []
});

module.exports = mongoose.model("Business", BusinessSchema);