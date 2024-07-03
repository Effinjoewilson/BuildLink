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
    let verifiedAgentCount = await adminHelpers.getVerifiedAgentCount();
    let unverifiedAgentCount = await adminHelpers.getUnverifiedAgentCount();
    res.render('admin/main', { admin: true, name, userCount, agentCount, verifiedAgentCount, unverifiedAgentCount });
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

  router.get('/verify-agents', verifyAdminLogin, async (req, res) => {
    let name = req.session.admin;
    let agents = await adminHelpers.getAllAgentsWithProfileImage();
    //console.log(agents)
    res.render('admin/verify-agent', { admin: true, name, agents });
  });

  router.post('/verify-agent', verifyAdminLogin, async (req, res) => {
    let agentId = req.body.agentId;
    await adminHelpers.verifyAgent(agentId);
    res.json({ status: true });
  });

  router.post('/reject-agent', verifyAdminLogin, async (req, res) => {
    let agentId = req.body.agentId;
    await adminHelpers.rejectAgent(agentId);
    res.json({ status: true });
  });

  router.get('/verify-services', verifyAdminLogin, async (req, res) => {
    let name = req.session.admin;
    let agentServices = await adminHelpers.getAgentServices();
    //console.log(agentServices)
    res.render('admin/verify-services', { admin: true, name, agentServices });
  });

  router.post('/accept-service', (req, res) => {
    console.log(req.body)
    adminHelpers.acceptService(req.body)
      .then(result => {
        res.json({ status: true });
      })
      .catch(err => {
        console.error('Error accepting service:', err);
        res.json({ status: false });
      });
  });
  

module.exports = router;
