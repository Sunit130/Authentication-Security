//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get("/", function(req,res){
    res.render("home");
});




app.get("/secrets", function(req, res){
    if(req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});




app.route("/login")


.get(function(req,res){
    res.render("login");
})


.post(function(req, res){
    const user = new User({
        username : req.body.username,
        passport : req.body.password
    });
    req.login(user, function(err){
        if(err) {
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});





app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});





app.route("/register")


.get(function(req, res) {
    res.render("register");
})


.post(function(req, res){
    User.register({username:req.body.username}, req.body.password, function(err, user){
        if(!err) {

            passport.authenticate("local")(req, res, function(){
                console.log("Entered")
                res.redirect("/secrets");
            });

        } else {
            console.log(err);
            res.redirect('/login');
        }
    });

});




app.listen(3000, function(){
    console.log("Server is started at port 3000");
});
