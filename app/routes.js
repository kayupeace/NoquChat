var request = require("request");
var Business = require("../models/business");
var Session = require("../models/session");

module.exports = function(app) {

    // Server index page
    // app.get("/", function (req, res) {
    //   res.send("Deployed!");
    // });
    app.get('*', function(req, res) {
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
              processPostback(event);
            } else if (event.message) {
              processMessage(event);
            }
          });
        });

        res.sendStatus(200);
      }
    });

    function processPostback(event) {
      var senderId = event.sender.id;
      var payload = event.postback.payload;

      if (payload === "Greeting") {
        // Get user's first name from the User Profile API
        // and include it in the greeting
        request({
          url: "https://graph.facebook.com/v2.6/" + senderId,
          qs: {
            access_token: process.env.PAGE_ACCESS_TOKEN,
            fields: "first_name"
          },
          method: "GET"
        }, function(error, response, body) {
          var greeting = "";
          if (error) {
            console.log("Error getting user's name: " +  error);
          } else {
            // Create session object or clear business on session object
            var business = new Business({
                business_id: 0, 
                name: "",
                ABN: 0,
                menu: []
            });
            updateSession(senderId, business);

            var bodyObj = JSON.parse(body);
            name = bodyObj.first_name;
            greeting = "Hi " + name + ". ";
          }
          var message = greeting + "My name is Noqu. I can relay your purchase orders to businesses. Which business would you like to access?";
          sendMessage(senderId, {text: message});
        });
      }
      else if (payload.search(/select_business/i) == 0) {
        var businessID = payload.replace("select_business=", "");
        findBusinessByID(senderId, businessID);
      }

    }

    // sends message to user
    function sendMessage(recipientId, message) {
      request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
          recipient: {id: recipientId},
          message: message,
        }
      }, function(error, response, body) {
        if (error) {
          console.log("Error sending message: " + response.error);
        }
      });
    }

    //process message
    function processMessage(event) {
      if (!event.message.is_echo) {
        var message = event.message;
        var senderId = event.sender.id;

        console.log("Received message from senderId: " + senderId);
        console.log("Message is: " + JSON.stringify(message));

        // You may get a text or attachment but not both
        if (message.text) {
          var formattedMsg = message.text.toLowerCase().trim();

          // If we receive a text message, check to see if it matches any special
          // keywords and send back the corresponding business detail.
          // Otherwise, search for new business.
          findBusinessByName(senderId, formattedMsg);
          
        } else if (message.attachments) {
          sendMessage(senderId, {text: "Sorry, I don't understand your request."});
        }
      }
    }

    // Create Business
    function createBusiness(userId, message){
        var businessID = parseInt(Math.random() * 10000000)
        var business = new Business({
            business_id: businessID, 
            name: message,
            ABN: businessID + 10000000,
            menu: []
        });
        business.save(function (err, business) {
          if (err) return console.error(err);
        });
        sendMessage(userId, {text: "Created business: " + businessID +  " " + message});
    }

    // Create or update session
    function updateSession(userId, business){
        Session.findOne({'user_id': userId}, 'user_id business', function (err, session){
          if(err){
            sendMessage(userId, {text: "Something went wrong. Try again"});
          }
          else{
            // if session found
            if(session){
              session.business = {
                'business_id': business.business_id,
                'name': business.name,
                'ABN': business.ABN,
              };
              session.save(function(err, session){
                if (err) return console.error(err)
              });
            }
            // else create session
            else{
              var sesh = new Session({
                user_id: userId,
                business:{
                  'business_id': business.business_id,
                  'name': business.name,
                  'ABN': business.ABN,
                }
              });
              sesh.save(function(err, session){
                if (err) return console.error(err)
              })
            }
          }
        });
    }

    // Find Business by Name
    function findBusinessByName(userId, message){
        Business.find({'name': { "$regex": message, "$options": "i" }}, 'name business_id ABN menu -_id', function (err, businesses) {
          if (err){
            sendMessage(userId, {text: "Something went wrong. Try again"});
          }
          else{
            if(businesses.length){
                var strMessage = "Found " + businesses.length + " businesses: ";
                var businessArray = []
                for(i = 0; i < businesses.length; i ++){
                    var businessButton = {
                        type: "postback",
                        title: businesses[i].toObject().name,
                        payload: "select_business=" + businesses[i].toObject().business_id
                    };
                    businessArray.push(businessButton);
                }
                attachMessage = {
                  attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: strMessage,
                        buttons: businessArray
                    }
                  }
                };
                sendMessage(userId, attachMessage);
            }
            else{
              sendMessage(userId, {text: "Cannot find business. Try again"});
            }
            
          }
          
        });
    }

    // find business by ID
    function findBusinessByID(userId, businessID){
        Business.findOne({'business_id': businessID}, 'name business_id ABN menu -_id', function(err,business){
            if(err){
                sendMessage(userId, {text: "Something went wrong. Try again"});
            }
            else{
                if(business){
                    sendMessage(userId, {text: "Selected business: " + business.business_id + " " + business.name + " " + business.ABN });

                    // var businessDB = new Business({
                    //     business_id: business.business_id, 
                    //     name: business.name,
                    //     ABN: business.ABN,
                    //     menu: business.menu
                    // });
                    updateSession(userId, business);
                }
                else{
                    sendMessage(userId, {text: "Cannot find business. Try again"});
                }
            }
        });
    }

}