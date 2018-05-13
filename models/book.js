var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ratingSchema = new Schema({
  user: {type: String, required: true},
  rating: {
      type: Number,
      required: true
  }
});

var bookSchema = new Schema({
  title: {
      type: String,
      required: true
  },
  author: {
      type: String,
      required: true
  },
  published: {
      type: Number,
      required: true
  },
  ratings : [ratingSchema]

});

var book = mongoose.model("Book", bookSchema);

module.exports = book;
