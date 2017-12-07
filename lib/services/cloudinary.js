'use strict';
var fs = require('fs');
var cloudinary = require('cloudinary');

var s3 = new cloudinary.config({
    cloud_name: 'he3vux9xr',
    api_key: '662715979616844',
    api_secret: 'RtWkt5QnZ7YM_odvtVk3iO98AMI'
});


var uploadToCloud = function(fileInfo, next) {

    cloudinary.uploader.upload(fileInfo.path,
    function (result) {
            //console.log(result);
            return next(null, result);
    }, {
            folder: 'profile',
            use_filename: true
        });
};

var downloadFromCloud = function(fileName, next){
    console.log("not implemented");
    return next(null, 'Not Implemented');
};

// multiple image upload :
// https://scotch.io/@codebyomar/how-to-upload-multiple-images-with-cloudinary-and-node-js
/**
 *
 * function take following parameter to remove/clean up aws s3 Bucket
 *
 * @param
 *  dataFile = {
        fileName: fileFirstName,
        dataPath: "profile/",
        mimeType: fileType
    };
 * @param next
 */
var deleteFromCloud = function(dataFile, next){
    cloudinary.v2.uploader.destroy(dataFile,
        function(error, result) {
            console.log(result);
    });

};

module.exports = {
    uploadToCloud: uploadToCloud,
    downloadFromCloud: downloadFromCloud,
    deleteFromCloud: deleteFromCloud
};