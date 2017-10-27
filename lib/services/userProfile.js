'use strict';
var UserProfile = require(__base + 'models/userProfile.js');

var createProfile = function(data, next){
    var DOB = new Date(data.DOB);
    var gender = data.gender;
    var imageURL = data.imageURL;
    var profileData;

    if(imageURL === null) {
        profileData = {
            DOB: DOB,
            gender: gender,
            patron_id: data.user_id
        };
    }else {
        profileData = {
            DOB: DOB,
            gender: gender,
            patron_id: data.user_id,
            imagePath: imageURL
        };
    }


    console.log("create new profile"+DOB + "   " + gender);

    UserProfile.create(profileData, function(err, user){
        if(err){
            return next(err);
        }else {
            return next(null, user);
        }
    });
};


var updateProfile = function(data, next){
    var DOB = new Date(data.DOB);
    var gender = data.gender;
    var imageURL = data.imageURL;


    var profileData;
    if(imageURL !== null){
        profileData= {
            DOB: DOB,
            gender: gender,
            imageURL: imageURL
        };
    }else{
        profileData= {
            DOB: DOB,
            gender: gender
        };
    }

    console.log(DOB + "   " + gender);
    UserProfile.findOne({ patron_id: data.user_id })
        .exec(function (err, profile) {
            if (err) {
                return next(err);   // error, navigate to error page.
            } else {
                if (!profile) {
                    createProfile(data, next, function(err){
                        if(err){
                            return next(err);
                        }
                        return next(null, profile);
                    });
                } else {
                    profile.gender = profileData.gender;
                    profile.DOB = profileData.DOB;
                    if(profileData.imageURL){
                        profile.imagePath = profileData.imageURL;
                    }
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