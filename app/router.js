var func = require("./fb_functions")
var businesses = require('../routes/business');
var registrationRouter = require('../routes/register');
var loginRouter = require('../routes/login');
var User = require('../models/user.js');
var Facebook_account = require('../models/facebook.js');
var config = require('../lib/config/config.js').get(process.env.NODE_ENV);
var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(app) {

    var facebook_data = config.facebook;
    passport.use(new FacebookStrategy({
            clientID: facebook_data.clientID,
            clientSecret: facebook_data.clientSecret,
            callbackURL: facebook_data.callbackURL,
            profileFields: ['id', 'emails', 'photos','displayName']
        },
        function(accessToken, refreshToken, profile, done) {
            console.log("\n\n" + profile.id);
            console.log(profile.displayName);
            console.log(profile.emails);
            var name = profile.displayName;
            var emails = profile.emails[0].value;
            if(!name){
                name = 'Anonymous'
            }
            if(!emails){
                emails = 'Anonymous@email.com'
            }

            var userData = {
                email: emails,
                username: name,
                password: ' '
            };

            Facebook_account.findOne({
                facebook_id: profile.id
            },function(err, facebook_account){
                //console.log("1");
                if(err){ return done(err); }
                if (!facebook_account){
                    //console.log("2");
                    User.create(userData, function(err, user){
                        if(err){
                            //console.log("3");
                            return done(err, user);
                        }else {
                            //console.log("4");
                            var facebook_data = {
                                patron_id: user._id,
                                facebook_id: profile.id
                            };
                            Facebook_account.create(facebook_data,function(err){
                                if(err){return done(err);}
                                return done(null, user);
                            })
                        }
                    })
                }else{
                    //console.log("5");
                    User.findOne({ _id : facebook_account.patron_id},
                        function(err, findmyUser){
                        if(err){ return done(err); }
                        return done(null, findmyUser);
                    })
                }
            });
            //return(done, profile);
        }
    ));


    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email','user_friends']}));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { failureRedirect: '/' }),
        function(req, res) {
            // Successful authentication, redirect home.
            req.session.userId = req.user._id;
            console.log("success with facebook login");
            res.redirect('/user/profile');
        });


    app.use('/registration', registrationRouter);
    app.use('/user', loginRouter);

    // Server index page
    app.get('/', function(req, res) {
        // sendfile is being deprecagted
        // res.sendfile('./public/views/index.html'); // load our public/index.html file
        //res.sendFile('/public/views/index.pug', { root: process.cwd() });
        res.render('index');
    });

    // Businesses API
    app.use('/business', businesses);

    // Facebook Webhook
    // Used for verification
    app.get("/webhook", function (req, res) {
      if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
        console.log("Verified webhook");
        res.status(200).send(req.query["hub.challenge"]);
      } else {
        console.error("Verification failed. The tokens do not match.");
        res.sendStatus(403);
      }
    });

    // All callbacks for Messenger will be POST-ed here
    app.post("/webhook", function (req, res) {
      // Make sure this is a page subscription
      if (req.body.object == "page") {
        // Iterate over each entry
        // There may be multiple entries if batched
        req.body.entry.forEach(function(entry) {
          // Iterate over each messaging event
          entry.messaging.forEach(function(event) {
            /* 
             * TODO store search session details, 
             * i.e. when a user successfully finds and selects a business, save it for current session use
             */
            if (event.postback) {
              func.processPostback(event);
            } else if (event.message) {
              func.processMessage(event);
            }
          });
        });

        res.sendStatus(200);
      }
    });

}