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

router.get('/', verifyLogin, (req, res) => {
  var name = req.session.agent.name;
  var verified = req.session.agent.verified;
  agentHelpers.getAllServiceRequests().then((users) => {
    res.render('agent/main', { agent: true, name, verified, users });
  });
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

router.get('/my-services',verifyLogin,(req,res)=>{
  var name = req.session.agent.name
  let agentId=req.session.agent.agentId
  agentHelpers.doTakeAgentServices(agentId).then((agentServices)=>{
    //console.log(agentServices)
    res.render('agent/my-services',{agent:true,name,agentServices});
  })
})

router.get('/add-services',verifyLogin,(req,res)=>{
  var name = req.session.agent.name
  res.render('agent/add-services',{agent:true,name});
})

router.post('/add-services',(req,res)=>{
  //console.log(req.session)
  let agentId=req.session.agent.agentId
   agentHelpers.addServices(req.body,agentId).then(()=>{
    res.redirect('/agent/my-services')
   })
})

router.get('/my-profile', verifyLogin, (req, res) => {
  let agentId = req.session.agent.agentId;
  agentHelpers.getAgentProfile(agentId).then((agent) => {
      //console.log(agent)
      res.render('agent/my-profile', { agent: true, ...agent });
  });
});

router.post('/update-profile', verifyLogin, (req, res) => {
  let agentId = req.session.agent.agentId;
  agentHelpers.updateAgentProfile(agentId, req.body).then(() => {
    if(req.files && req.files.verificationImage) {
      let image = req.files.verificationImage;
      image.mv(`./public/verification-files/${agentId}.jpg`, (err) => {
        if (!err) {
          res.redirect('/agent/my-profile');
        } else {
          console.log(err);
          res.redirect('/agent/my-profile');
        }
      });
    } else {
      res.redirect('/agent/my-profile');
    }
  });
});

router.post('/update-service-price', verifyLogin, (req, res) => {
  let { serviceId, price } = req.body;
  agentHelpers.updateServicePrice(serviceId, price).then(() => {
    res.json({ status: true });
  }).catch((error) => {
    console.error(error);
    res.json({ status: false });
  });
});

module.exports = router;