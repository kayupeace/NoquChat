'use strict';
/**
 *
 * new user profile file used cloudinary , a free good for me (poor guy) to use
 *
 */
var User = require(__base + 'models/user.js');
var UserProfile = require(__base + 'models/userProfile.js');
var Cloudinary = require(__base + 'lib/services/cloudinary.js');
var async = require("async");
var fs = require('fs');


var createProfile = function(data, next){
    var DOB = new Date(data.DOB);
    var gender = data.gender;
    var imageURL = data.imageURL;
    var imagePublicId = data.imagePublicId;
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
            imagePath: imageURL,
            imagePublicId: imagePublicId
        };
    }

    console.log("create new profile: "+DOB + "   " + gender);

    UserProfile.create(profileData, function(err, user){
        if(err){
            return next(err);
        }else {
            return next(null, user);
        }
    });
};

var removeProfileImage = function(fileFullName, next){
    if(!fileFullName){
        let error = new Error("Missing File Name");
        return next(error);
    }

    Cloudinary.deleteFromCloud(fileFullName, function(err, data){
        if(err){ //file if not exist in S3 WILL NOT RETURN ERROR!!
            //console.log(err, err.stack); // an error occurred
            return next(err);
        }else {
            //console.log(data);
            return next();
        }
    });
};

var updateProfile = function(data, next){
    console.log("updateasdasdasdasd");
    var DOB = new Date(data.DOB);
    var gender = data.gender;
    var imageURL = data.imageURL;
    var imagePublicId = data.imagePublicId;
    //console.log(imageURL);
    //console.log(imagePublicId);
    var profileData;
    if(imageURL !== null){
        profileData= {
            DOB: DOB,
            gender: gender,
            imageURL: imageURL,
            imagePublicId: imagePublicId
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
                        // remove previous uploaded aws file
                        removeProfileImage(profile.imagePublicId,function (err) {
                            if(err) {
                                console.log(err); // if unable to delete, good luck with this
                            }
                        });
                        profile.imagePath = profileData.imageURL;
                        profile.imagePublicId = profileData.imagePublicId;
                    }
                    profile.save(function(err){
                        if(err){
                            console.log(err.message);
                            return next(err);   // error, navigate to error page.
                        }else{
                            return next(null, profile);
                        }
                    });
                }
            }
        });
};

var editUserProfile = function (fileInfo, userData, next){
    let DOB = new Date(userData.DOB);
    let gender = userData.gender;
    let patron_id = userData.patron_id;

    async.waterfall(
        [
            function uploadProfileImage(next) {
                if(fileInfo) {

                    if (!/^image\/(jpe?g|png|gif)$/i.test(fileInfo.mimetype)) {
                        let err = new Error("expect image file");
                        return next(err);
                    }

                    Cloudinary.uploadToCloud(fileInfo, function(err, result){
                        // Remove Template File even if error occur during upload
                        fs.unlink(fileInfo.path, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            console.log('File deleted!');
                        });

                        if(err){
                            //console.log('error when upload!');
                            return next(err);
                        }else {
                            ///console.log("\n\n\n FILE INFORMATION");
                            console.log(result);
                            //console.log(result.secure_url);

                            let fileData = {
                                fileName : result.secure_url,
                                imagePublicId : result.public_id,
                            };
                            return next(null,fileData);
                        }
                    });

                }else {
                    let fileName = null; //no image is provide
                    return next(null, fileName);
                }
            },
            function getUserInfo(fileData,callback) {
                let data ={
                    DOB: DOB,
                    gender: gender,
                    imageURL: null,
                    imagePublicId: null,
                    user_id: patron_id
                };
                if (fileData !== null) {
                    data.imageURL = fileData.fileName;
                    data.imagePublicId = fileData.imagePublicId;
                }
                return callback(null, data);
            }
        ],
        function editUserProfile(err, data) {
            console.log("Get User Information");

            if(err){
                console.log(err.message);
                return next(err);
            }else {
                updateProfile(data, function (err) {
                    if (err) {
                        // remove current uploaded file
                        if (data != null) {
                            removeProfileImage(data.imagePublicId);
                        }
                        return next(err);
                    } else {
                        return next();
                    }
                });
            }
        }
    );

};


module.exports = {
    createProfile: createProfile,
    removeProfileImage: removeProfileImage,
    editUserProfile: editUserProfile
};