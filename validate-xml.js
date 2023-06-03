const libxmljs = require( 'libxmljs' )
const fs = require( 'fs' )

const xsdDoc = libxmljs.parseXml(fs.readFileSync("/Users/administrator/Code/designer/third-party/OpenDRIVE_1.4/OpenDRIVE_1.4H_Schema_Files.xsd", "utf8"));
const xmlDoc = libxmljs.parseXml(fs.readFileSync("/Users/administrator/Code/designer/src/assets/open-drive/crossing-8-complex.xodr", "utf8"));

const isValid = xmlDoc.validate(xsdDoc);
console.log(isValid); // true if document is valid according to the schema

if (!xmlDoc.validate(xsdDoc)) {
    console.log("XML is invalid.");
    console.log("Validation errors:", xmlDoc.validationErrors);
} else {
    console.log("XML is valid.");
}

// TODO
// expose api in preload to validate xml
// currenty only first error is error and then it stops
// we need to fix known error and then get all errors and display them in the UI
//
