var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')
var session = require('express-session')
const handlebars = require('handlebars');

var db = require('./config/connection')
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var agentRouter = require('./routes/agent');

var app = express();

handlebars.registerHelper('isEqual', function (value1, value2, options) {
  return value1 === value2 ? options.fn(this) : options.inverse(this);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials/'}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'Key',resave: true,saveUninitialized: true,cookie:{maxAge:600000}}))

db.connect((err)=>{
  if(err) console.log("Connection Error : "+err);
  else console.log("Database Connected");
})
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/agent', agentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
