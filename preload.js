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
