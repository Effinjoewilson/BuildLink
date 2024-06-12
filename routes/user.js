var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/user/login')
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  //console.log(req.session)
  var name = req.session.user

  userHelpers.getAgentServices().then((agentServices)=>{
    //console.log(agentServices)
    res.render('user/main',{user:true,name,agentServices});
  })
});

router.get('/login', function(req, res, next) {
  //console.log("user")
  if(req.session.user){
    res.redirect('/user')
  }else{
    res.render('user/login',{"loginErr":req.session.userloginErr})
    req.session.userloginErr=false
  }
});

router.post('/login', (req, res, next) =>{
  //console.log("user loggedIn")
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
        req.session.user=response.user
        req.session.userLoggedIn=true
      res.redirect('/user');
    }else{
      req.session.userloginErr='Invalid username or password'
      console.log("Invalid username or password")
      res.redirect('/user/login');
    } 
  })
});

router.get('/signup', function(req, res, next) {
  //console.log("user signup")
  res.render('user/signup',{"SignupErr":req.session.userSignupErr})
  req.session.userSignupErr=false
});

router.post('/signup',(req, res)=> {
  //console.log(req.body)
  userHelpers.doSignup(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.userLoggedIn=true
      res.redirect('/user');
    }else{
      req.session.userSignupErr='Alredy existing user'
      console.log("Alredy existing user")
      res.redirect('/user/signup');
    }
  })
});

router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})

module.exports = router;
