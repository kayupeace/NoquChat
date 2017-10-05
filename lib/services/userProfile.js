'use strict';
var UserProfile = require(__base + 'models/userProfile.js');

var createProfile = function(req, res, next){
    var DOB = new Date(req.body.dateOfBirth);
    var gender = req.body.gender;

    var profileData = {
        DOB : DOB,
        gender : gender,
        patron_id : req.session.id
    };
    console.log("create new profile"+DOB + "   " + gender);

    UserProfile.create(profileData, function(err, user){
        if(err){
            return next(err);
        }else {
            return next(null, user);
        }
    });
};


var updateProfile = function(req, res, next){
    var DOB = new Date(req.body.dateOfBirth);
    var gender = req.body.gender;
    var profileData = {
        DOB: DOB,
        gender: gender
    };
    console.log(DOB + "   " + gender);
    UserProfile.findOne({ patron_id: req.session.id })
        .exec(function (err, profile) {
            if (err) {
                return next(err);   // error, navigate to error page.
            } else {
                if (!profile) {
                    createProfile(req, res, next);
                    return next(null, profile);
                } else {
                    profile.gender = profileData.gender;
                    profile.DOB = profileData.DOB;
                    profile.save(function(err){
                        if(err){
                            return next(err);   // error, navigate to error page.
                        }else{
                            return next(null, profile);
                        }
                    });

                }
            }
        });
};

module.exports = {
    createProfile: createProfile,
    updateProfile: updateProfile
};