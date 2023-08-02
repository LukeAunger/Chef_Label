if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

let express = require('express')
let mongoose = require('mongoose')
let Label = require('./models/labels')
let users = require('./models/login')
let labelRouter = require('./routes/labels')
let methodoverride = require('method-override')
let app = express()
const passport = require('passport')
let flash = require('express-flash')
let session = require('express-session')
let bcrypt = require('bcrypt')

mongoose.connect('mongodb+srv://ltaunger:1234@3006wk7.ulps3tf.mongodb.net/cheflabeldb?retryWrites=true&w=majority', {useUnifiedTopology: true, useNewUrlParser: true
})

app.use('/labels', labelRouter);

let initializePassport = require('./passport-config')
 

initializePassport(
    passport,
    email => users.findOne(user => req.params.email === email),
    //id => users.find(user => user.id === id)
)

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodoverride('_method'))

app.get('/', checkAuthenticated, async(req, res) => {
    let labels = await Label.find().sort({
        createdAt: 'desc' })
    res.render('labels/index', { labels: labels })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('labels/login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'labels/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('labels/register.ejs')
})
  
app.post('/register', checkNotAuthenticated, async (req, res, next) => {
    req.user = new users()
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let user = req.user
        user.name = req.body.name,
        user.email = req.body.email,
        user.password = hashedPassword
    try {
        user = await user.save()
        res.redirect('labels/login')
    } catch {
      res.redirect('labels/register')
    }
    console.log(users.email);
    next()
})


app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
  });

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(9000)
