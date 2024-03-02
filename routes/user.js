var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  //console.log("user")
  res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
  //console.log("user")
  res.render('user/login');
});

router.post('/login', function(req, res, next) {
  //console.log("user loggedIn")
  res.render('user/main',{user:true});
});

router.get('/signup', function(req, res, next) {
  //console.log("user signup")
  res.render('user/signup');
});

router.post('/signup', function(req, res, next) {
  //console.log("user")
  res.render('user/main',{user:true});
});

module.exports = router;
