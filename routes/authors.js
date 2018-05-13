var express = require('express');
var mongoose = require("mongoose");
var router = express.Router();

var Author = require('../models/author');
var Book = require('../models/book');

//adds an author to the list
router.post('/addAuthor', checkUser, function(req,res) {
    var author = new Author({
        name : req.body.name,
    });
      author.save()
        .then(item => {
            console.log(true)
          req.flash('success', "The author: " + author.name + " has been added");
          res.redirect('/authors');
        })
        .catch(err => {
          res.status(400).send("unable to save to database");
        });
});

//form to add the author
router.get('/addAuthor', checkUser, function(req, res) {
  res.render('authorForm');
});

//lists all authors
router.get('/', function(req, res) {
  Author.find({}, function(err, authors){
      if(err){
          console.log(err);
      } else {
          res.render('authors', {authors: authors});
      }
  });
});

//gets single author
router.get('/:id', function(req, res) {
    Author.findById(req.params.id, function(err, author){
        if(err){
            console.log(err)
            res.redirect('/authors')
        } else{
            Book.find({author:author.name}, function(err,books){
                if(err){
                    console.log(err)
                } else{
                    if (books.length==0){books=false;};
                    res.render('singleAuthor', {author:author, books:books})
                }
            })
        }
    })

});

//delete an author
router.post('/delete/:id', checkAdmin, function(req, res) {
    Author.findByIdAndRemove(req.params.id,function(err,author){
        if(err){
            console.log(err);
        } else{
            res.redirect('/authors');
        }
    })
});

//edit an author
router.get('/edit/:id', checkAdmin, function(req, res) {

    Author.findById(req.params.id,function(err,author){
        if(err){
            console.log(err);
        } else{
            res.render('editAuthor', {author:author});
        }
    })

});

//saves edited author
router.post('/edit/:id', checkAdmin, function(req, res) {
    data = {
        name: req.body.name
    };
    Author.findOneAndUpdate(req.params.id, data, function(err,author){
        if(err){
            console.log(err)
        }else{
            req.flash('success','Author updated')
            res.redirect('/authors');
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
