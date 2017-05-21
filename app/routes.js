var express = require("express");
var func = require("./fb_functions")

module.exports = function(app) {

    // Serve static files on /public
    app.use('/public', express.static('./public'))

    // Server index page
    app.get('/', function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

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