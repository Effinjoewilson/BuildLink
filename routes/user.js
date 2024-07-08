var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
var ObjectId = require('mongodb').ObjectId
const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/user/login')
  }
}

/* GET users listing. */
router.get('/', verifyLogin,function(req, res, next) {
  //console.log(req.session)
  var name = req.session.user.name

  userHelpers.getServices().then((services)=>{
    //console.log(services)
    res.render('user/main',{user:true,name,services});
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

router.post('/add-to-crate', verifyLogin, (req, res) => {
  //console.log(req.session)
  userHelpers.addToCart(req.session.user, req.body).then((response) => {
    res.json({ status: true });
  }).catch((err) => {
    res.json({ status: false });
  });
})

router.get('/cart', verifyLogin, function (req, res, next) {
  var name = req.session.user.name
  userHelpers.getCart(req.session.user.userId).then((cart) => {
    res.render('user/cart', { user: true, cart, name });
  });
});

router.post('/post-services', verifyLogin, async (req, res) => {
  const { district, location } = req.body;
  try {
      // Fetch user's cart to post services
      let cart = await userHelpers.getCart(req.session.user.userId);

      // Post services to service requests collection and clear cart
      await userHelpers.postServices(req.session.user.userId, district, location, cart);

      res.json({ status: true });
  } catch (error) {
      console.error('Error posting services:', error);
      res.json({ status: false });
  }
});

router.post('/edit-cart', verifyLogin, (req, res) => {
  const { serviceName, quantity } = req.body;
  userHelpers.editCart(req.session.user.userId, serviceName, quantity).then(() => {
      res.json({ status: true });
  }).catch((err) => {
      res.json({ status: false });
  });
});

router.post('/delete-cart', verifyLogin, (req, res) => {
  const { serviceName } = req.body;
  userHelpers.deleteFromCart(req.session.user.userId, serviceName).then(() => {
      res.json({ status: true });
  }).catch((err) => {
      res.json({ status: false });
  });
});

router.get('/orders', verifyLogin, async function (req, res, next) {
  var name = req.session.user.name
  try {
    const userId = req.session.user.userId;
    const serviceRequests = await userHelpers.getServiceRequestsByUser(userId);
    //console.log("serviceRequests : ", serviceRequests);

    // Ensure agentServiceRequests includes serviceId for matching
    const agentServiceRequests = await userHelpers.getAgentServiceRequestsByUser(userId);
    //console.log("agentServiceRequests : ", agentServiceRequests);

    res.render('user/orders', { user: true, serviceRequests, agentServiceRequests, name });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.redirect('/user');
  }
});

module.exports = router;
