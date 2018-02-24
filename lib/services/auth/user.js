'use strict';

const User = require(__base + 'models/user.js');

function isvalidString(str){
    //console.log("Invalid String Format");
    let format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (str === null || str.match(/^ *$/) !== null || format.test(str) === true){
        //if one of them are return is not valid (true)
        return false; //in valid
    }else {
        console.log("valid String");
        return true;  // valid
    }
}

function isvalidEmail(str){
    let format = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if(format.test(str) === false){
        // if one of them are matched and string is not valid (true state)
        return false; // return not valid
    }else {
        console.log("valid email");
        return true; // return valid
    }
}

function createUser(req, next) {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;

    let checkEmail = isvalidEmail(email);
    let checkusername = isvalidString(username);
    let checkpassword = isvalidString(password);

    if (!checkEmail || !checkusername || !checkpassword){  //if one of them are not valid which return true
        let errorMessage = "";
        if(!checkEmail){
            errorMessage += "Email ,";
        }
        if(!checkusername){
            errorMessage += "user name ,";
        }
        if(!checkpassword){
            errorMessage += 'password ,';
        }
        let errorInfo = "Error: " + errorMessage + " are not in correct format";
        let error = new Error(errorInfo);
        //err.status = 400;
        req.session.error = (errorInfo);
        return next(error);
    } else {
        console.log( "   email: " + email + "\n" + "   username: " + username + "\n   password: "+password);
        let userData = {
            email: email,
            username: username,
            password: password
        };

        User.create(userData, function(err, user){
            if (err){
                let errorInfo = "Error: Unable to Create Account, either username or email or both are exist"
                let error = new Error(errorInfo);
                //err.status = 400;
                req.session.error = (errorInfo);
                return next(error);
            }else{
                req.session.userId = user._id; //store user session ID
                return next(null, user);
            }
        });
    }
}

function getUser(req, next) {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password){
        let errorInfo = "Error: Email, UserName, password are required";
        let error = new Error(errorInfo);
        //err.status = 400;
        req.session.error = (errorInfo);
        return next(error);
    }

    User.findOne({ email: email})
        .exec(function (err, user) {
            if (err) {
                let errorInfo = "System Error, Contact System Administration";
                let error = new Error(errorInfo);
                //err.status = 400;
                req.session.error = (errorInfo);
                return next(error);
            } else if (!user) {
                let errorInfo = "Can not find User";
                let error = new Error(errorInfo);
                //err.status = 400;
                req.session.error = (errorInfo);
                return next(error);
            }
            if (!user.verifyPassword(user, password)){
                let errorInfo = "Incorrect Password";
                let error = new Error(errorInfo);
                //err.status = 400;
                req.session.error = (errorInfo);
                return next(error);
            }else {
                req.session.userId = user._id; //store user session ID
                //res.locals.session = true;
                return next(null, user);
            }
        });

}


module.exports = {
    createUser,
    getUser
};