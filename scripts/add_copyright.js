const fs = require( 'fs' );
const path = require( 'path' );

// Set the copyright notice
const copyrightNotice = `/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */`;

// Specify the target folder
const targetFolder = '/Users/administrator/Code/designer/src/app/';

// Get all files recursively in the target folder
function getAllFiles ( dirPath, arrayOfFiles ) {
	const files = fs.readdirSync( dirPath );

	arrayOfFiles = arrayOfFiles || [];

	files.forEach( ( file ) => {
		const filePath = path.join( dirPath, file );

		if ( fs.statSync( filePath ).isDirectory() ) {
			arrayOfFiles = getAllFiles( filePath, arrayOfFiles );
		} else {
			arrayOfFiles.push( filePath );
		}
	} );

	return arrayOfFiles;
}

// Check if the file already contains the copyright notice
function fileContainsCopyright ( fileContent ) {
	return fileContent.includes( copyrightNotice );
}

// Add the copyright notice to each file
function addCopyrightNoticeToFiles ( files ) {
	files.forEach( ( file ) => {
		const fileExtension = path.extname( file );

		if ( fileExtension === '.css' || fileExtension === '.ts' ) {
			fs.readFile( file, 'utf8', ( err, data ) => {
				if ( err ) {
					console.error( `Error reading file: ${ file }`, err );
					return;
				}

				// Check if the file already contains the copyright notice
				if ( !fileContainsCopyright( data ) ) {
					const content = `${ copyrightNotice }\n\n${ data }`;

					fs.writeFile( file, content, 'utf8', ( err ) => {
						if ( err ) {
							console.error( `Error writing file: ${ file }`, err );
							return;
						}

						console.log( `Copyright notice added to file: ${ file }` );
					} );
				} else {
					console.log( `Copyright notice already present in file: ${ file }` );
				}
			} );
		}
	} );
}

// Get all files in the target folder
const files = getAllFiles( targetFolder );

// Add copyright notice to the files
addCopyrightNoticeToFiles( files );
