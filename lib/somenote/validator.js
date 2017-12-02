'use strict'
//Using express-validator

//For this tutorial, we'll primarily be using the following APIs:

//checkBody(parameter, message): Specifies a body (POST) parameter to validate along with a message to be displayed if it fails the tests. The validation criteria are daisy chained to the checkBody() method. For example, the first check below will test that the "name" parameter is alphanumeric and set an error message "Invalid name" if it is not. The second test checks that the age parameter has an integer value.
req.checkBody('name', 'Invalid name').isAlpha();
req.checkBody('age', 'Invalid age').notEmpty().isInt();
//sanitizeBody(parameter): Specifies a body parameter to sanitize. The sanitization operations are then daisy-chained to this method. For example, the escape() sanitization operation below removes HTML characters from the name variable that might be used in JavaScript cross-site scripting attacks.
req.sanitizeBody('name').escape();
//To run the validation we call req.validationErrors(). This returns an array of error objects (or false if there are no errors) and is typically used like this

var errors = req.validationErrors();
if (errors) {
    // Render the form using error information
}
else {
    // There are no errors so perform action with valid data (e.g. save record).
}
//Each error object in the array has values for the parameter, message and value.

//{param: 'name', msg: 'Invalid name', value: '<received input>'}
//Note: The API also has methods to check and sanitize query and url parameters (not just body parameters as shown). For more information see: express-validator (npm).
