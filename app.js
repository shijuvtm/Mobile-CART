var createError = require('http-errors');
var fs1 = require('fs');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { engine }= require('express-handlebars');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var session = require('express-session')

var app = express();
var fileUpload = require('express-fileupload')
var db=require('./config/connection')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  partialsDir: __dirname + '/views/partial/',
  layoutsDir: __dirname + '/views/layout/',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true, // Allow prototype properties
    allowProtoMethodsByDefault: true,   // Allow prototype methods
  },
}));
app.use(logger('dev'));
app.use(express.json());
app.use(session({secret:"Key",cookie:{maxAge:600000}}))
app.use(cookieParser());
app.use('/public',express.static(path.join(__dirname,'public')));
app.use(fileUpload());


app.use(express.urlencoded({ extended: true })); // Parse form data

db.connect();
app.use('/', userRouter);
app.use('/admin', adminRouter);


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
