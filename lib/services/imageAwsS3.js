'use strict';
var fs = require('fs');
var AWS = require('aws-sdk');


var s3 = new AWS.S3({
    region: 'ap-southeast-2',
    accessKeyId: "AKIAJKN74ETDBZXD2XKA",
    secretAccessKey: "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"
});


var uploadToS3 = function(fileInfo, dataFile, next){
    let mimeType = fileInfo.mimetype;
    //let fileName = fileInfo.path + '.' + mimeType.substring(mimeType.indexOf("/") + 1);
    //let awsName = fileName.substring(fileName.indexOf("/") + 1);
    let fileName = dataFile.fileName +'.' + mimeType.substring(mimeType.indexOf("/") + 1);
    let awsName = dataFile.dataPath + fileName;

    console.log(awsName);

    let fileStream = fs.readFileSync(fileInfo.path);
    const options = {
        Bucket: 'noqubot',
        Key: awsName,
        Body: fileStream,
        ACL: 'public-read',
        ContentType: mimeType
    };

    //console.log("remove template file");
    //fs.closeSync(fileStream);  if open by file descriptor
    //fs.unlinkSync(filename); //does not return anything, might not be best solution
    //fs.removeFileSync("tmp/" + fileInfo.path); //// ideally use the async version

    s3.upload(options, function(err){
        if (err){
            console.log(err);
            return next(err);
        }
        return next(null, 'File Uploaded');
    });
};

var downloadFromS3 = function(fileName, next){
    const options = {
        Bucket: 'noqubot',
        Key: fileName
    };
    // if try to get file data, it's better to write second filestream to avoid call back hell
    var fileStream = s3.getObject(options).createReadStream().on('error', function(err){
        console.log(err);
        return next(err);
    });
    return next(null, fileStream);

    //s3.getObject(options).createReadStream().pipe(res);
    // s3.getObject(params).createReadStream().on('error', function(err){
    // console.log(err);
    // }).pipe(file);
};

var deleteFromS3 = function(fileName, next){
    const options = {
        Bucket: 'noqubot',
        Key: fileName
    };

    s3.deleteObject(options, function(err, data) {
        if (err) {
            //console.log(err, err.stack); // an error occurred
            return next(err);
            //return res.status(400).end("file is not exist");
        } else {
            //console.log(data);           // successful response
            return next(null, data);
            //return res.end("successful delete");
        }
    });

};

module.exports = {
    uploadToS3: uploadToS3,
    downloadFromS3: downloadFromS3,
    deleteFromS3: deleteFromS3
};