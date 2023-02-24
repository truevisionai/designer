/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu } = require( 'electron' );
const execFile = require( 'child_process' ).execFile;
const path = require( 'path' );

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let editorWindow;

const TITLE = "Truevision"
const MIN_WIDTH = 1280;
const MIN_HEIGHT = 980;

let openDevTools = false;
let showSplashScreen = true;
let loadLocahost = false;

// load opengl to fix line rendering issues
app.commandLine.appendSwitch( "use-angle", "gl" );

process.argv.forEach( function ( arg, index, array ) {

    if ( arg.includes( "open-dev-tools" ) ) {
        openDevTools = true;
    } else if ( arg.includes( "disable-splash" ) ) {
        showSplashScreen = false;
    } else if ( arg.includes( "localhost" ) ) {
        loadLocahost = true;
    }

} );

function openEditorWindow () {

    // Create the browser window.
    editorWindow = new BrowserWindow( {
        title: TITLE,
        width: MIN_WIDTH,
        height: MIN_HEIGHT,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        backgroundColor: '#ffffff',
        icon: `file://${ __dirname }/dist/assets/icon.png`,
        webPreferences: {
            nodeIntegration: true,
      		contextIsolation: true,
			allowRunningInsecureContent: true,
			preload: path.join(__dirname, 'preload.js')
        }
    } );

    if ( loadLocahost ) {

        editorWindow.loadURL( `http://localhost:4200` );

    } else {

		const remoteMain = require("@electron/remote/main")
		remoteMain.initialize()
		remoteMain.enable(editorWindow.webContents)

		editorWindow.loadFile('dist/index.html')
        // editorWindow.loadURL( `file://${ __dirname }/dist/index.html` );

    }

    // Open the DevTools.
    if ( openDevTools ) editorWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    editorWindow.on( 'closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        editorWindow = null
    } )
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
            nodeIntegration: true
        }
    } );

    splashWindow.loadURL( `file://${ __dirname }/src/splash.html` );

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

// helpers method to read current directory in angular
ipcMain.on( 'current-directory', ( event, arg ) => {

    event.returnValue = __dirname;

} );

Menu.setApplicationMenu( null );
