var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();

var Author = require('../models/author');
var User = require('../models/user');
var Book = require('../models/book');
var CommentSchema = require('../models/comment');

//lists all books
router.get('/', function(req, res) {
  Book.find({}, function(err, books){
      if(err){
          console.log(err);
      } else {
          res.render('books', {books: books, currentuser:req.user});
      }
  });
});

//renders add book form
router.get('/addBook', checkUser, function(req, res) {
    Author.find({}, function(err, authors){
        if(err){
            console.log(err);
        } else {
            res.render('bookForm', {authors: authors});
        }
    });
});

//saves a new book
router.post('/addBook', checkUser, function(req,res) {
    req.checkBody('title', "Title is required").notEmpty();
    req.checkBody('author', "Author is required").notEmpty().isString();
    req.checkBody('published', "Year published is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('bookForm', {errors:errors});
    } else {
        var data = new Book({
            title : req.body.title,
            author: req.body.author,
            published: req.body.published
        });
          data.save()
            .then(item => {
              req.flash('success', data.title + " by " + data.author + " has been added");
              res.redirect('/books');
            })
            .catch(err => {
              //res.status(400).send("unable to save to database");
              res.render('bookForm', {errors: "Unable to save to database currently"});
            });
    }
})

//find book by id
router.get('/:id', function(req, res) {
    //pass user id to render so that the favourites form can post with userid or else not show favourite form
    if (req.user){
        var currentuser = req.user
    } else{
        currentuser = false
    }
    //display book details
    Book.findById(req.params.id, function(err, book){
        if (err){
            console.log(err);
        }else{
            CommentSchema.find({bookID:req.params.id},function(err,comments){
                if(err){
                    console.log(err);
                }else{
                    res.render('singleBook', {book:book, comments:comments, currentuser: currentuser, ratings:book.ratings})
                }
            })
        }
    });
});

//adds a comment on a book
router.post('/:id/addComment', checkUser, function(req, res) {

    req.checkBody('comment', "Comment cannot be empty").notEmpty();
    var errors = req.validationErrors();

    if (errors) {
        router.get('/' + req.params.id);
    } else {
        var data = new CommentSchema({
            bookID : req.params.id,
            user: req.user.username,
            body: req.body.comment
        });
          data.save()
            .then(item => {
              req.flash('success', "Your comment has been added");
              res.redirect('/books/' + req.params.id);
            })
            .catch(err => {
              //res.status(400).send("unable to save to database");
              res.render('bookForm', {errors: "Unable to save to database currently"});
            });
    }
});

//adds a rating on a book
router.post('/:bookid/addRating/:username', checkUser, function(req, res) {
    Book.findOneAndUpdate({'_id':req.params.bookid, 'ratings.user': {$ne:req.params.username}},{ $push: { 'ratings': {rating:req.body.rating,user:req.params.username}}}, {upsert:true}, function(err,book){
        if(err){
            console.log(err);
            console.log("Above error may be a duplicate key error preventing more than one rating");
            req.flash('danger', 'You can only rate a book once');
            res.redirect('/books/' + req.params.bookid);
        } else{
            res.redirect('/books/' + req.params.bookid)
        }
    })
});


//delete a book
router.post('/delete/:id', checkAdmin, function(req, res) {
    Book.findByIdAndRemove(req.params.id,function(err,book){
        if(err){
            console.log(err);
        } else{
            res.redirect('/books');
        }
    })
});

//edit a book
router.get('/edit/:id', checkAdmin, function(req, res) {
    Author.find({}, function(err, authors){
        if(err){
            console.log(err);
        } else {
            Book.findById(req.params.id,function(err,book){
                if(err){
                    console.log(err);
                } else{
                    res.render('editBook', {book:book,authors:authors});
                }
            })
        }
    });

});

//saves edited book
router.post('/edit/:id', checkAdmin, function(req, res) {
    data = {
        title: req.body.title,
        author: req.body.author,
        published: req.body.published
    }
    Book.findOneAndUpdate(req.params.id, data, function(err,book){
        if(err){
            console.log(err)
        }else{
            req.flash('success','Book updated')
            res.redirect('/books');
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


function checkUser(req,res,next){
    if (req.isAuthenticated()){
        return next();
    } else{
        req.flash('danger', 'You must be logged in to do that');
        res.redirect('/users/login');
    }
}

module.exports = router;
