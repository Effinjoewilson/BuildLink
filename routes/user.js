var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  //console.log("user")
  res.render('user/main',{user:true});
});

router.get('/login', function(req, res, next) {
  //console.log("user")
  res.render('user/login');
});

router.post('/login', (req, res, next) =>{
  //console.log("user loggedIn")
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      res.redirect('/user');
    }else{
      console.log("Invalid username or password")
      res.redirect('/user/login');
    } 
  })
});

router.get('/signup', function(req, res, next) {
  //console.log("user signup")
  res.render('user/signup');
});

router.post('/signup',(req, res)=> {
  //console.log(req.body)
  userHelpers.doSignup(req.body).then(()=>{
    //include session details here
    res.redirect('/user');
  })
});

module.exports = router;
