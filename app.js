const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const Handlebars = require('handlebars')
const db = require('./config/connection')
const session = require('express-session');
const nocache = require('nocache');
// const fileUpload = require('express-fileupload')
// const mongoose = require('mongoose');
const bodyParser = require('body-parser')

const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');


const usersRouter = require('./routes/users');
const vendorRouter = require('./routes/vendor')
const adminRouter = require('./routes/admin');
const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({extname: 'hbs', 
            defaultLayout: 'layout',
          layoutsDir: __dirname+ '/views/layouts', partialsDir: __dirname+ '/views/partials',
          helpers: {
            total: (quant, price)=>{
              return quant * price;
            },
            add : (x, y)=> {return x + y},
            json:(obj)=>{
              return JSON.stringify(obj)
            },                                            
            discountPrice : (oPrice, discount)=>{
              return oPrice - (oPrice / 100 * discount)
            },
            discount : (oPrice, discount)=>{
              oPrice = parseInt(oPrice)
              discount = parseInt(discount)
              return oPrice / 100 * discount;
            },
            parseInt : (string)=>{
              return parseInt(string)
            },
            isEqual : (a, b, options)=>{
              if(a == b){
                return options.fn(this)
              }
              return options.inverse(this)
            },
            multiply : (a, b)=>{
              a = parseInt(a);
              b = parseInt(b)
              return a*b
            }
             
          },
          handlebars: allowInsecurePrototypeAccess(Handlebars)}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const MemoryStore = session.MemoryStore;
app.use(session({
  name: 'app.sid',
  secret: '1234567890QWERTY',
  resave: true,
  store: new MemoryStore(),
  saveUninitialized: true,
  cookie: {maxAge: 600000}
}));


app.use(bodyParser.json())
app.use(nocache())

db.connect((err)=>{
  if(err) console.log(err);
})


const userHelpers = require('./helpers/user-helpers')
const isBlocked = function (req, res, next) {
  if(req.session.user){
     userHelpers.isBlocked(req.session.user._id).then((no) => {
    next()
  }).catch((yes)=>{
    req.session.user = null;
    req.session.userBlocked = true;
    res.redirect("/signIn");
    console.log("user Blocked");
  })
  }else{
    next()
  }

};






app.use('/',isBlocked, usersRouter);
app.use('/vendor', vendorRouter)
app.use('/admin', adminRouter);
app.use('*', (req, res)=>{
  res.render('error')
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  const massage = `app available at field of ->"${err}"`
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


