var express = require('express');
var bcrypt = require('bcryptjs');
var randomstring = require('randomstring');
var passport = require('passport');
var router = express.Router();

var mailer = require('../routes/mailer');
var User = require('../models/user');

//sign up page
router.get('/register', function(req, res) {
  res.render('register');
});

//saving data posted from sign up page
router.post('/createUser', function(req,res) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var Cpassword = req.body.Cpassword;

    //make an admin account if the username registered with is 'admin'
    var createAdmin = false;
    if (username=="admin"){
        var createAdmin = true
    }

    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('Cpassword', 'Passwords do not match').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('signup', {errors:errors});
    } else {
        var myData = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            isAdmin: createAdmin
        });

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(myData.password, salt, function(err, hash){
                if(err){
                    console.log(err);
                }
                myData.password = hash;
                secretToken = randomstring.generate();
                myData.secretToken = secretToken;
                myData.active = false;

                myData.save()
                  .then(item => {
                      mailer.sendEmail(
                          'NOREPLY <admin@bookface.com>',
                          req.body.username + " " + req.body.email,
                          'Bookface verification',
                          "<h1> To verify your email visit the link below:</h1><br><a href=" + "http://localhost:3000/users/register/verify/" + secretToken + "/>http://localhost:3000/users/register/verify/" + secretToken +"</a>"
                      );
                    req.flash('success', 'Success, Please check your inbox to verify your email address and complete registration')
                    res.redirect('/users/login');
                  })
                  .catch(err => {
                    res.status(400).send("unable to save to database");
                  });

            }); //end hash
        }) //end getSalt
    } //end else
})

//manual token verification form
router.get('/register/verify', function(req, res) {
  res.render('verifyEmail');
});

//manually entering token on verification form
router.post('/register/verify', function(req, res) {
    var query = {"secretToken": req.body.secretToken}
    User.findOneAndUpdate(query, { secretToken:'', active: true}, function(err,user){
        if(err){console.log(err)};
        if(user==null){
            req.flash('error','No user with that token found to verify')
            res.redirect('/users/register');
            return;
        }else{
            req.flash('success','Verified, You may now login')
            res.redirect('/users/login');
        }
    })
});

//clicking on email link which automatically sends token through params
router.get('/register/verify/:id', function(req, res) {
    var query = {"secretToken": req.params.id}
    User.findOneAndUpdate(query, { secretToken:'', active: true}, function(err,user){
        if(err){console.log(err)};
        if(user==null){
            req.flash('error','No user with that token found to verify')
            res.redirect('/users/register');
            return;
        }else{
            req.flash('success','Verified, You may now login')
            res.redirect('/users/login');
        }
    })
});

//render login page
router.get('/login', function(req, res) {
  res.render('login');
});

//Checks if login has correct details
router.post('/validateLogin', function(req,res,next) {
    passport.authenticate('local',{
        successRedirect: '/',
        successFlash: 'Login Successful',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req,res,next);
});

//get request to logout
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', "You are now logged out");
  res.redirect('/')
});

//lists all the users
router.get('/', function(req, res) {
  User.find({},function(err,users){
      if(err){
          console.log(err);
      } else{
          if(req.user){console.log(req.user.isAdmin);}
         res.render('users', {users:users, currentuser:req.user});
      }
  });
});

//adds favourite books to user
router.post('/:userid/addFavourite/:bookid', function(req, res) {
    //addToSet prevents duplicate favourites
    User.findByIdAndUpdate(req.params.userid,{ $addToSet: { "favourites": req.params.bookid }}, {upsert:true}, function(err,user){
        if(err){
            console.log(err);
        } else{
            res.redirect('/users/'+req.params.userid);
        }
    })
});

//renders single user and their favourites on their user page
router.get('/:id', function(req, res) {
    User.findById(req.params.id).populate('favourites').exec(function(err,user){
        if(err){
            console.log(err);
        } else{
            res.render('singleUser', {user:user, favourites:user.favourites});
        }
    })
});

//delete a user
router.post('/delete/:id', checkAdmin, function(req, res) {
    User.findByIdAndRemove(req.params.id,function(err,user){
        if(err){
            console.log(err);
        } else{
            res.redirect('/users');
        }
    })
});

//edit a user
router.get('/edit/:id', checkAdmin, function(req, res) {
    User.findById(req.params.id,function(err,user){
        if(err){
            console.log(err);
        } else{
            res.render('editUser', {user:user});
        }
    })
});

//saves edited user
router.post('/edit/:id', checkAdmin, function(req, res) {
    data = {
        username: req.body.username,
        email:req.body.email
    }
    User.findByIdAndUpdate(req.params.id, data, function(err,user){
        if(err){
            console.log(err)
        }else{
            req.flash('success','User updated')
            res.redirect('/users');
        }
    })
});

function checkAdmin(req,res,next){
    if (req.isAuthenticated() && req.user.isAdmin){
        return next();
    } else{
        req.flash('danger', 'You must be an admin to do that');
        res.redirect('/users/login');
    }
}

module.exports = router;
