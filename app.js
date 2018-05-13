var express = require('express');
var path = require('path');
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var session = require('express-session');
var config = require('./config/database');
var passport = require('passport');


mongoose.Promise = global.Promise;
mongoose.connect(config.database);
let db = mongoose.connection;

var app = express();

//uses pug templating engine and gets files from views folder
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug');


//serve static files e.g style.css for index.pug
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

//routes index.pug
var mainRoute = require('./routes/mainRoute');
app.use('/', mainRoute);

var books = require('./routes/books');
app.use('/books', books);

var authors = require('./routes/authors');
app.use('/authors', authors);

var users = require('./routes/users');
app.use('/users', users);


//app runs on localhost:3000
app.listen(process.env.PORT || '3000');
