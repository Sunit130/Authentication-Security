//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);



const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);



passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user._id);
    // if you use Model.id as your idAttribute maybe you'd want
    // done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {

        User.findOrCreate({
            googleId: profile.id
        }, function(err, user) {
            return cb(err, user);
        });
    }
));




app.get("/", function(req, res) {
    res.render("home");
});




app.get("/auth/google",
    passport.authenticate("google", {
        scope: ["profile"]
    }));




app.get("/auth/google/secrets",
    passport.authenticate("google", {
        failureRedirect: "/login"
    }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
    });




app.get("/secrets", function(req, res) {
    User.find({"secret":{$ne:null}}, function(err, userSecrets){
        if(err) {
            console.log(err);
        } else {
            res.render("secrets", {userSecrets:userSecrets});
        }
    });
    // if (req.isAuthenticated()) {
    //     res.render("secrets");
    // } else {
    //     res.redirect("/login");
    // }
});




app.route("/submit")

.get( function(req, res) {
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/login");
    }
})

.post( function(req, res) {
    const secret = req.body.secret;
    // console.log();
    User.findById(req.user.id, function(err, foundUser){
        if(err) {
            console.log(err);
        } else {
            if(foundUser) {
                foundUser.secret = secret;
                foundUser.save(function(){
                    res.redirect("/secrets");
                });
            }
        }
    });
});


app.route("/login")


    .get(function(req, res) {
        res.render("login");
    })


    .post(function(req, res) {
        const user = new User({
            username: req.body.username,
            passport: req.body.password
        });
        req.login(user, function(err) {
            if (err) {
                console.log(err);
                res.redirect("/login");
            } else {
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/secrets");
                });
            }
        });
    });





app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});





app.route("/register")


    .get(function(req, res) {
        res.render("register");
    })


    .post(function(req, res) {
        User.register({
            username: req.body.username
        }, req.body.password, function(err, user) {
            if (!err) {

                passport.authenticate("local")(req, res, function() {
                    console.log("Entered")
                    res.redirect("/secrets");
                });

            } else {
                console.log(err);
                res.redirect('/login');
            }
        });

    });




app.listen(3000, function() {
    console.log("Server is started at port 3000");
});
