//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);


app.get("/", function(req,res){
    res.render("home");
});



app.route("/login")

.get(function(req,res){
    res.render("login");
})

.post(function(req, res){
    const femail = req.body.username;
    const fpassword = req.body.password;
    User.findOne({ email:femail, password:fpassword }, function(err, foundUser){
        if(!err) {
            if(foundUser) {
                res.render("secrets");
            }
        } else {
            console.log(err);
        }
    });
});


app.route("/register")

.get(function(req, res) {
    res.render("register");
})

.post(function(req, res){
    const user = new User({
        email : req.body.username,
        password : req.body.password
    });

    user.save(function(err){
        if(!err) {
            res.render("secrets");
        } else {
            console.log(err);
        }
    });
});

app.listen(3000, function(){
    console.log("Server is started at port 3000");
});
