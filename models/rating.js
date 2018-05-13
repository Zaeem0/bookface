var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ratingSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref:'User'},
  book: {type: Schema.Types.ObjectId, ref:'Book'},
  rating: {
      type: Number,
      required: true
  }
});

var rating = mongoose.model("Rating", ratingSchema);

module.exports = rating;
