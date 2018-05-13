var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {
      type: String,
      required: true

  },
  email: {
      type: String,
      required: true

  },
  password: {
      type: String,
      required: true

  },
  favourites: [{type: Schema.Types.ObjectId, ref:'Book'}],
  //secretToken is used to verify user and sent in email address
  secretToken: {
      type: String
  },
  //active is whether or not the user is verified
  active: {
      type: Boolean, default:false
  },
  isAdmin: {
      type: Boolean, default:false
  }
});

var user = mongoose.model("User", userSchema);

module.exports = user;
