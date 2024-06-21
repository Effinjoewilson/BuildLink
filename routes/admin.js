var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');

const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

/* GET admin listing. */
router.get('/', verifyAdminLogin, async function(req, res, next) {
    //console.log(req.session)
    var name = req.session.admin;
    let userCount = await adminHelpers.getUserCount();
    let agentCount = await adminHelpers.getAgentCount();
    res.render('admin/main', { admin: true, name, userCount, agentCount });
});

router.get('/login', function(req, res, next) {
  if (req.session.admin) {
    res.redirect('/admin');
  } else {
    res.render('admin/login', { "loginErr": req.session.adminLoginErr });
    req.session.adminLoginErr = false;
  }
});

router.post('/login', (req, res, next) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect('/admin');
    } else {
      req.session.adminLoginErr = 'Invalid username or password';
      res.redirect('/admin/login');
    }
  });
});

/*router.get('/signup', function(req, res, next) {
  res.render('admin/signup', { "SignupErr": req.session.adminSignupErr });
  req.session.adminSignupErr = false;
});

router.post('/signup', (req, res) => {
  adminHelpers.doSignup(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect('/admin');
    } else {
      req.session.adminSignupErr = 'Already existing admin';
      res.redirect('/admin/signup');
    }
  });
});*/

router.get('/logout', (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect('/');
});

router.get('/all-users', verifyAdminLogin, async (req, res) => {
    let name = req.session.admin
    let users = await adminHelpers.getAllUsers();
    res.render('admin/all-users', { admin: true, users, name });
  });
  
  router.get('/all-agents', verifyAdminLogin, async (req, res) => {
    let name = req.session.admin
    let agents = await adminHelpers.getAllAgents();
    res.render('admin/all-agents', { admin: true, agents, name });
  });

module.exports = router;
