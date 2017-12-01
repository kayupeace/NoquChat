'use strict';
var User = require(__base + 'models/user.js');
var UserProfile = require(__base + 'models/userProfile.js');
var AwsS3 = require(__base + 'lib/services/imageAwsS3.js');
var async = require("async");
var fs = require('fs');


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
        return next(err);
    }
    let fileFirstName = fileFullName.substring(0,fileFullName.indexOf("."));
    let fileType = fileFullName.substring(fileFullName.indexOf(".") + 1);

    let dataFile = {
        fileName: fileFirstName,
        dataPath: "profile/",
        mimeType: fileType
    };

    AwsS3.deleteFromS3(dataFile, function(err, data){
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
                        // remove previous uploaded aws file
                        removeProfileImage(profile.imagePath,function (err) {
                            if(err) {
                                console.log(err); // if unable to delete, good luck with this
                            }
                        });
                        profile.imagePath = profileData.imageURL;
                    }
                    profile.save(function(err){
                        if(err){
                            console.log(err.message)
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
    let fileName = null;

    async.waterfall(
        [
            function uploadProfileImage(next) {
                if(fileInfo) {

                    if (!/^image\/(jpe?g|png|gif)$/i.test(fileInfo.mimetype)) {
                        let err = new Error("expect image file");
                        return next(err);
                    }
                    let dataFile = {
                        fileName: fileInfo.filename,
                        dataPath: "profile/"
                    };

                    /**
                    fs.unlink(fileInfo.path, function (err) {
                        let mimeType = fileInfo.mimetype;
                        fileName = dataFile.fileName +'.'+ mimeType.substring(mimeType.indexOf("/") + 1);
                        return next(null,fileName);
                    });
                     **/

                    AwsS3.uploadToS3(fileInfo, dataFile, function(err){
                        // Remove Template File even if error occur during aws upload
                        fs.unlink(fileInfo.path, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            console.log('File deleted!');
                        });

                        if(err){
                            return next(err);
                        }else {
                            let mimeType = fileInfo.mimetype;
                            fileName = dataFile.fileName +'.'+ mimeType.substring(mimeType.indexOf("/") + 1);
                            return next(null,fileName);
                        }
                    });

                }else {
                    return next(null, fileName);
                }
            },
            function getUserInfo(fileName,callback) {
                let data ={
                    DOB: DOB,
                    gender: gender,
                    imageURL: null,
                    user_id: patron_id
                };
                if (fileName !== null) {
                    data.imageURL = fileName;
                    //let err = new Error('You are required to login');
                    //err.status = 400;
                    //return callback(err);   // error, naviage to error page.
                }
                return callback(null, data);
            }
        ],
        function editUserProfile(err, data) {
            //console.log("Get User Information");

            if(err){
                return next(err);
            }
            updateProfile(data,function(err){
                if(err){
                    // remove current uploaded aws file
                    if(fileName != null) {
                        removeProfileImage(fileName);
                    }
                    return next(err);
                }else {
                    return next();
                }
            });
        }
    );

};


module.exports = {
    createProfile: createProfile,
    removeProfileImage: removeProfileImage,
    editUserProfile: editUserProfile
};