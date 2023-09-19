/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, screen, ipcMain } = require( 'electron' );
const path = require( 'path' );
const log = require( 'electron-log' );

log.info( 'App Launched' );

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let editorWindow;

const TITLE = "Truevision"
const MIN_WIDTH = 1280;
const MIN_HEIGHT = 980;

let openDevTools = false;
let showSplashScreen = true;

// load opengl to fix line rendering issues
app.commandLine.appendSwitch( "use-angle", "gl" );

process.argv.forEach( function ( arg, index, array ) {

	if ( arg.includes( "open-dev-tools" ) ) {
		openDevTools = true;
	} else if ( arg.includes( "disable-splash" ) ) {
		showSplashScreen = false;
	}

} );

function openEditorWindow () {

	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	editorWindow = new BrowserWindow( {
		title: TITLE,
		width: width,
		height: height,
		minWidth: MIN_WIDTH,
		minHeight: MIN_HEIGHT,
		backgroundColor: '#ffffff',
		icon: `file://${ __dirname }/dist/assets/icon.png`,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			allowRunningInsecureContent: true,
			preload: path.join( __dirname, 'preload.js' )
		}
	} );

	const remoteMain = require( "@electron/remote/main" )
	remoteMain.initialize()
	remoteMain.enable( editorWindow.webContents )

	editorWindow.loadFile( 'dist/index.html' )

	// Open the DevTools.
	if ( openDevTools ) editorWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	editorWindow.on( 'closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		editorWindow = null
	} )

	editorWindow.on( 'ready-to-show', () => {

		log.info( 'editor window loaded' )

		checkForUpdates();

	} );
}

function checkForUpdates () {

	const { autoUpdater } = require( 'electron-updater' );
	autoUpdater.logger = log;
	autoUpdater.logger.transports.file.level = 'info';

	// Log "checking-for-update" event
	autoUpdater.on( 'checking-for-update', () => {
		console.log( '[electron-updater] Checking for update' );
	} );

	// Log "update-available" event
	autoUpdater.on( 'update-available', ( info ) => {
		console.log( '[electron-updater] Update available:', info );
	} );

	// Log "update-not-available" event
	autoUpdater.on( 'update-not-available', ( info ) => {
		console.log( '[electron-updater] Update not available:', info );
	} );

	// Log "error" event
	autoUpdater.on( 'error', ( err ) => {
		console.error( '[electron-updater] Update error:', err );
	} );

	// Log "download-progress" event
	autoUpdater.on( 'download-progress', ( progressObj ) => {
		console.log( '[electron-updater] Download progress:', progressObj );
	} );

	// Log "update-downloaded" event
	autoUpdater.on( 'update-downloaded', ( info ) => {
		console.log( '[electron-updater] Update downloaded:', info );
	} );

	autoUpdater.checkForUpdatesAndNotify();

}

function openSplashWindow () {

	// Create the browser window.
	let splashWindow = new BrowserWindow( {
		title: TITLE,
		width: 720,
		height: 405,
		backgroundColor: '#ffffff',
		resizable: false,
		movable: false,
		minimizable: false,
		maximizable: false,
		closable: true,
		alwaysOnTop: true,
		fullscreenable: false,
		frame: false,
		icon: `file://${ __dirname }/dist/assets/icon.png`,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: true,
			allowRunningInsecureContent: true,
		}
	} );

	splashWindow.loadFile( 'dist/splash.html' )

	// Open the DevTools.
	if ( openDevTools ) splashWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	splashWindow.on( 'closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		splashWindow = null;
	} );


	setTimeout( () => {

		openEditorWindow();

		splashWindow.close();

	}, 5000 );
}

function createWindow () {

	if ( showSplashScreen == true ) {

		openSplashWindow();

	} else {

		openEditorWindow();

	}

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on( 'ready', createWindow )

// app.commandLine.appendSwitch( 'remote-debugging-port', '9222' )

// Quit when all windows are closed.
app.on( 'window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if ( process.platform !== 'darwin' ) {
		app.quit()
	}
} );

app.on( 'activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if ( editorWindow === null ) {
		createWindow()
	}
} );

// this is deprecated and not used anywhere
// // helpers method to read current directory in angular
// ipcMain.on( 'current-directory', ( event, arg ) => {
//     event.returnValue = __dirname;
// } );

// Create the Application's main menu
var template = [
	{
		label: TITLE,
		submenu: [
			{ label: "Quit", accelerator: "Command+Q", click: function () { app.quit(); } }
		]
	},
	{
		label: "Edit",
		submenu: [
			{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
			{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
			{ type: "separator" },
			{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
			{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
			{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
			{ label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
		]
	}
];

ipcMain.on( 'get-installation-dir', ( event, arg ) => {
	let exePath = app.getPath( 'exe' );
	let installationDir = path.dirname( exePath );
	event.returnValue = installationDir;
} )

// not needed on windows
if ( process.platform === 'win32' ) {

	Menu.setApplicationMenu( null );

} else {

	Menu.setApplicationMenu( Menu.buildFromTemplate( template ) );
}
