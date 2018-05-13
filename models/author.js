var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authorSchema = new Schema({
  name: String
});

var author = mongoose.model("Author", authorSchema);

module.exports = author;
