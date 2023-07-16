var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars')//its also typing appu becouse you can install hbs handle bar (npm install express-handlebars)
var app = express();
var fileUpload=require('express-fileupload')//this is uesd to  yp load the  file

var db=require('./config/connection')//this is usd to connect config file
var session=require('express-session')//this line are used to session creation
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partial/'}))//to set the engine temple  using this link its doing appu

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());//this is files upload app 
app.use(session({secret:"key",cookie:{maxAge:6000000}})) //this session are used to 60000000 millisecond are login time after 60000000 millisecond it will outomatically logout

db.connect((err)=>{
  if(err)console.log("connaction is error"+err);
  else console.log("database connect to port 27017 ")//this line are used to run the code withou error if any arror it will not show "data base connect to port 27017"
})//conect db

app.use('/', userRouter);//we can change this name user
app.use('/admin',adminRouter);//we can change this name admine

// catch 404 and forward to error handler
app.use(function(req,res,next) {
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
