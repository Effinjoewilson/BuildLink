var express = require('express');
var router = express.Router();

router.get('/',(req, res)=> {
    res.render('agent/main',{agent:true});
  });

module.exports = router;