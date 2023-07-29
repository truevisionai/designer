const { contextBridge } = require( 'electron' )
const remote = require( '@electron/remote' )
const fs = require( 'fs' )

// NOTE: fs.stat on macos is not working properly this is bug fix
const statHelper = {
	isFile: ( path ) => fs.statSync( path ).isFile(),
	isDirectory: ( path ) => fs.statSync( path ).isDirectory(),
	isBlockDevice: ( path ) => fs.statSync( path ).isBlockDevice(),
	isCharacterDevice: ( path ) => fs.statSync( path ).isCharacterDevice(),
	isSymbolicLink: ( path ) => fs.statSync( path ).isSymbolicLink(),
	isFIFO: ( path ) => fs.statSync( path ).isFIFO(),
	isSocket: ( path ) => fs.statSync( path ).isSocket(),
}

contextBridge.exposeInMainWorld( 'versions', {
	currentDirectory: __dirname,
	remote: () => remote,
	setTitle: ( name ) => remote.getCurrentWindow().setTitle( name ),
	fs: () => fs,
	fsPromises: () => require( 'fs/promises' ),
	stat: statHelper
} )

contextBridge.exposeInMainWorld( 'stat', statHelper )

contextBridge.exposeInMainWorld( 'process', remote.process )

contextBridge.exposeInMainWorld( 'require', remote.require )

// not in use for testing
contextBridge.exposeInMainWorld( 'dialog', {
	showSaveDialog: ( options ) => remote.dialog.showSaveDialog( options )
} )

contextBridge.exposeInMainWorld( 'fxp', {
	XMLParser: () => require( 'fast-xml-parser' ).XMLParser,
	XMLBuilder: () => require( 'fast-xml-parser' ).XMLBuilder,
	XMLValidator: () => require( 'fast-xml-parser' ).XMLValidator,
} )

const menus = new Array( 20 );
contextBridge.exposeInMainWorld( 'menus', {
	append: ( type, tempate ) => {
		const menu = new remote.Menu.buildFromTemplate( tempate );
		menus[ type ] = menu;
	},
	popup: ( type ) => {
		const m = menus[ type ];
		m.popup( {
			window: remote.getCurrentWindow()
		} );
	}
} )


var child = require( 'child_process' ).exec;
var spawn = require( 'child_process' ).spawn;

var binPath = null;
var scenarioPath = null;
var command = binPath + " --window 60 60 800 400" + " --odr " + scenarioPath;

// not in use for testing
contextBridge.exposeInMainWorld( 'command', {
	setBinPath: ( value ) => binPath = value,
	setScenarioPath: ( value ) => scenarioPath = value,
	execute: () => child( command, function ( err, data ) {
		console.log( err )
		console.log( data.toString() );
	} ),
	spawn: ( exec, args, out, err, close ) => {

		var cmd = spawn( exec, args );

		cmd.stdout.on( 'data', function ( data ) {
			out( data.toString() );
		} );

		cmd.stderr.on( 'data', function ( data ) {
			err( data.toString() );
		} )

		cmd.on( 'close', function ( code ) {
			close( code );
		} )

		return cmd;
	}
} )

