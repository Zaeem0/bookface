var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  bookID: {
      type: String,
      required: true
  },
  user: {
      type: String,
      required: true
  },
  body: {
      type: String,
      required: true
  }
});

var comment = mongoose.model("Comment", commentSchema);

module.exports = comment;
