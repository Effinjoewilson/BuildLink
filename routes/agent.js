var express = require('express');
var router = express.Router();
const agentHelpers = require('../helpers/agent-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.agentLoggedIn){
    next()
  }else{
    res.redirect('/agent/login')
  }
}

router.get('/',(req, res)=> {
  //console.log(req.session)
   var name = req.session.agent
    res.render('agent/main',{agent:true,name});
  });

router.get('/login',(req, res)=> {
  //console.log("agent")
  if(req.session.agent){
    res.redirect('/agent')
  }else{
    res.render('agent/login',{"loginErr":req.session.agentloginErr})
    req.session.agentloginErr=false
  }
});
  
router.post('/login', (req, res) =>{
  //console.log("agent loggedIn")
  agentHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
        req.session.agent=response.agent
        req.session.agentLoggedIn=true
      res.redirect('/agent');
    }else{
      req.session.agentloginErr='Invalid username or password'
      console.log("Invalid username or password")
      res.redirect('/agent/login');
    } 
  })
});

router.get('/signup',(req, res) =>{
  //console.log("agent signup")
  res.render('agent/signup',{"SignupErr":req.session.agentSignupErr})
  req.session.agentSignupErr=false
});

router.post('/signup',(req, res)=> {
  //console.log(req.body)
  agentHelpers.doSignup(req.body).then((response)=>{
    //include session details here
    if(response.status){
      req.session.agent=response.agent
      req.session.agentLoggedIn=true
      res.redirect('/agent');
    }else{
      req.session.agentSignupErr='Alredy existing agent'
      console.log("Alredy existing agent")
      res.redirect('/agent/signup');
    }
  })
});

router.get('/logout',(req,res)=>{
  req.session.agent=null
  req.session.agentLoggedIn=false
  res.redirect('/')
})

module.exports = router;