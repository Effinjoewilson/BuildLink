var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/secondPage', function(req, res, next) {
  res.render('secondPage',{admin:false});
});

module.exports = router;
