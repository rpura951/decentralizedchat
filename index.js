import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const expressSession = require('express-session')({
    secret: 'insert secret here',
    resave: false,
    saveUninitialized: false
})

import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';
import connectEnsureLogin from 'connect-ensure-login';

const app = express();
const port = 3000;

app.use(express.static(__dirname))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressSession)

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost/AlephChat')

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema);
passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//User.create({ username: 'Ralph', password: 'password'})
//User.create({ username: 'Michael Scott', password: 'invalid'})
//User.create({ username: 'Debby', password: 'password123'})

//User.register({ username: 'jackson', active:false}, 'password')

app.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    res.sendFile('views/index.html', { root: __dirname })
})

app.get('/login', (req,res) => {
    res.sendFile('views/login.html', { root: __dirname })
})

app.get('/register', (req,res) => {
    res.sendFile('views/register.html', { root: __dirname })
})

app.post('/register', (req,res) =>{
    const user = User.register({ username: req.body.username, active: false }, req.body.password, (err, user) =>{
        passport.authenticate('local')(req, res, () => {
            res.redirect('/')
        })
    })
})

app.post('/login', passport.authenticate('local'), (req, res) => {
    res.redirect('/')
})

app.get('/users/:username', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    User.findOne({ username: req.params.username }, (err, user) => {
        if (err){
            //do something
            res.send({ error: err })
        } else {
            res.send({ user:user })
        }
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}...`)
})

console.log(mongoose)