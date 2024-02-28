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
  //console.log("user")
  res.render('user/main',{user:true});
});

module.exports = router;
