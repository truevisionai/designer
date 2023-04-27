/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable, NgZone } from '@angular/core';

import { IFile } from '../core/models/file';
import { FileUtils } from './file-utils';
import { SnackBar } from './snack-bar.service';
import { TvElectronService } from './tv-electron.service';

declare const versions;

@Injectable( {
	providedIn: 'root'
} )
export class FileService {

	static electron: TvElectronService;

	public fileImported = new EventEmitter<IFile>();
	public fileSaved = new EventEmitter<IFile>();

	public fs: any;
	public path: any;
	private util: any;

	constructor ( public electronService: TvElectronService, private ngZone: NgZone ) {

		FileService.electron = electronService;

		if ( this.electronService.isElectronApp ) {

			this.fs = versions.fs();
			this.path = this.remote.require( 'path' );
			this.util = this.remote.require( 'util' );

		}

	}

	get remote () { return this.electronService.remote; }

	get userDocumentFolder () {
		return this.remote.app.getPath( 'documents' );
	}

	get currentDirectory () {
		return versions.currentDirectory;
	}

	get projectFolder () {

		if ( this.electronService.isWindows ) {

			return this.userDocumentFolder + '\\Truevision';

		} else if ( this.electronService.isLinux ) {

			return this.userDocumentFolder + '/Truevision';

		} else if ( this.electronService.isMacOS ) {

			return this.userDocumentFolder + '/Truevision';

		} else {

			throw new Error( 'Unsupported platform. Please contact support for more details.' );

		}
	}

	static openFile ( onImported: ( files: any ) => void = null, onRead: ( content: string ) => void = null ) {

		// TODO : Test one time creation
		const form = document.createElement( 'form' );
		const input = document.createElement( 'input' );

		input.type = 'file';

		form.appendChild( input );

		input.addEventListener( 'change', ( event: any ) => {

			onImported( event.target.files );

			const reader = new FileReader();

			reader.addEventListener( 'load', ( event: any ) => {

				onRead( event.target.result );

			}, false );

			reader.readAsText( event.target.files[ 0 ] );

		} );

		input.click();

	}

	static getExtension ( filename: string ): string {

		if ( this.electron.isWindows ) {

			const array = filename.split( '.' );

			return array[ array.length - 1 ];
		}

		const regEx = /(?:\.([^.]+))?$/;

		const extension = regEx.exec( filename )[ 1 ];

		return extension;
	}

	static getFilenameFromPath ( path: string ): string {

		return FileUtils.getFilenameFromPath( path );

	}

	async showAsyncDialog (): Promise<Electron.OpenDialogReturnValue> {

		const options = {
			title: 'Select file',
			buttonLabel: 'Import',
			filters: [],
			message: 'Select file'
		};

		return this.remote.dialog.showOpenDialog( options );
	}

	async readAsync ( path ) {

		return Promise.resolve( this.fs.readFileSync( path, 'utf-8' ) );

	}

	showOpenWindow ( path?: string, type: string = 'default', extensions = [ 'xml' ], callbackFn: any = null ) {

		const options = {
			title: 'Select file',
			buttonLabel: 'Import',
			defaultPath: path || this.projectFolder,
			filters: [
				{
					name: null,
					extensions
				}
			],
			message: 'Select file'
		};

		this.showOpenDialog( options, type, callbackFn );
	}

	showOpenDialog ( options: Electron.OpenDialogOptions, type, callbackFn: any = null ) {

		this.remote.dialog.showOpenDialog( options ).then( ( res: Electron.OpenDialogReturnValue ) => {

			if ( res.canceled ) {

				SnackBar.show( 'File import cancelled' )

			} else if ( res.filePaths.length > 0 ) {

				this.readFile( res.filePaths[ 0 ], type, callbackFn );

			}


		} );

	}

	/**
	 *
	 * @deprecated use import
	 */
	importFile ( path?: string, type: string = 'default', extensions = [ 'xml' ] ) {

		this.showOpenWindow( path, type, extensions, null );

	}

	readFile ( path: string, type: string = 'default', callbackFn: any = null ) {

		this.fs.readFile( path, 'utf-8', ( err, data ) => {

			if ( err ) {
				SnackBar.error( 'An error ocurred reading the file :' + err.message );
				return;
			}

			const file = new IFile();

			file.path = path;
			file.contents = data;
			file.type = type;
			file.updatedAt = new Date();

			// if ( callbackFn != null ) callbackFn( file );

			// Need to call the callback function from ngZone to trigger change detection in Angular
			if ( callbackFn != null ) this.ngZone.run( () => callbackFn( file ) );

			this.fileImported.emit( file );

		} );

	}

	saveFile ( defaultPath: string, contents: string, callbackFn: any = null ): any {

		this.writeFile( defaultPath, contents, callbackFn );

	}

	saveFileWithExtension ( directory: string = null, contents: string, extension: string, callbackFn: any = null ) {

		if ( directory == null ) directory = this.projectFolder;

		// TODO:
		const saveOptions = {
			title: 'Save File',
			defaultPath: 'Untitled.' + extension,
			filters: [
				{ name: 'All Files', extensions: [ extension ] }
			]
		};

		this.remote.dialog.showSaveDialog( saveOptions ).then( ( res: Electron.SaveDialogReturnValue ) => {

			if ( res.canceled ) return;

			let fullPath = res.filePath;

			if ( fullPath != null ) {

				// append the extension if not present in the path
				if ( !fullPath.includes( `.${ extension }` ) ) {

					fullPath = fullPath + '.' + extension;

				}

				this.writeFile( fullPath, contents, callbackFn );

			} else {

				SnackBar.error( 'Could not save file' );

			}

		} );

	}

	saveAsFile ( directory: string = null, contents: string, callbackFn: any = null ): any {

		if ( directory == null ) directory = this.projectFolder;

		const options = {
			defaultPath: directory
		};

		this.remote.dialog.showSaveDialog( options ).then( ( res: Electron.SaveDialogReturnValue ) => {

			if ( res.canceled || res.filePath == null ) {

				SnackBar.show( "file save cancelled" );

			} else {

				this.writeFile( res.filePath, contents, callbackFn );

			}

		} );

	}

	writeFile ( filepath, content, callbackFn: any = null ) {

		this.fs.writeFile( filepath, content, ( err, data ) => {

			if ( err ) {

				console.error( 'Error in writing file ', err );

				return;

			} else {

				const file = new IFile( null, filepath, content, null, null, new Date() );

				this.fileSaved.emit( file );

				if ( callbackFn != null ) callbackFn( file );

			}

		} );

	}

	listFiles ( path, callback ) {

		this.fs.readdir( path, ( err, files ) => {

			if ( err ) {

				console.log( 'Error getting directory information.' );

			} else {

				callback( files );

			}

		} );

	}

	deleteFolderSync ( path: string ) {

		if ( this.fs.existsSync( path ) ) {

			this.fs.rmdirSync( path, { recursive: true } );

		} else {

			console.error( 'folder does not exists', path );

		}

	}

	deleteFileSync ( path: string ) {

		this.fs.unlinkSync( path );

	}

	createFolder ( path: string, name: string = 'New Folder' ) {

		try {

			let folderName = name;

			let folderPath = this.join( path, folderName );

			let count = 1;

			while ( this.fs.existsSync( folderPath ) && count <= 20 ) {

				folderName = `${ name } (${ count++ })`;

				folderPath = this.join( path, folderName );

			}

			this.fs.mkdirSync( folderPath );

			return {
				name: folderName,
				path: folderPath
			};

		} catch ( error ) {

			// throw new Error( `Error in creating project at ${ path }` );

		}

	}

	createFile ( path: string, name: string = 'New Untitled', extension: string, contents: any ) {

		let slash = null;

		if ( this.electronService.isWindows ) slash = '\\';

		if ( this.electronService.isLinux ) slash = '/';

		let filePath = `${ path }${ slash }${ name }.${ extension }`;
		let fileName = name;

		if ( this.fs.existsSync( filePath ) ) {

			let count = 1;

			fileName = `${ name }(${ count })`;
			filePath = `${ path }${ slash }${ fileName }.${ extension }`;

			while ( this.fs.existsSync( filePath ) ) {

				fileName = `${ name }(${ count++ })`;
				filePath = `${ path }${ slash }${ fileName }.${ extension }`;

			}

		}

		this.fs.writeFileSync( filePath, contents );

		return { fileName, filePath };
	}

	readPathContents ( dirpath ) {
		return new Promise( resolve => {
			this.fs.readdir( dirpath, this.handled( files => {
				Promise.all( files.map( file => {
					const itemPath = this.path.join( dirpath, file );
					return this.getItemProperties( itemPath );
				} ) ).then( resolve );
			} ) );
		} );
	}

	readPathContentsSync ( dirpath ) {

		const files = this.fs.readdirSync( dirpath );

		const items = [];

		files.forEach( file => {

			const itemPath = this.path.join( dirpath, file );

			const itemWithProperites = this.getItemProperties( itemPath );

			items.push( itemWithProperites );

		} );

		return items;
	}

	getItemProperties ( itemPath ) {

		const stats = this.fs.statSync( itemPath );

		const name = FileService.getFilenameFromPath( itemPath );

		return {
			name: name,
			type: this.getItemType( stats, itemPath ),
			path: itemPath,
			size: stats.size,
			mtime: stats.mtime
		};
	}

	getItemType ( item, path ) {
		if ( versions.stat.isFile( path ) ) {
			return 'file';
		} else if ( versions.stat.isDirectory( path ) ) {
			return 'directory';
		} else if ( versions.stat.isBlockDevice( path ) ) {
			return 'blockdevice';
		} else if ( versions.stat.isCharacterDevice( path ) ) {
			return 'characterdevice';
		} else if ( versions.stat.isSymbolicLink( path ) ) {
			return 'symlink';
		} else if ( versions.stat.isFIFO( path ) ) {
			return 'fifo';
		} else if ( versions.stat.isSocket( path ) ) {
			return 'socket';
		}
		return '';
	}

	handled ( callback ) {
		return function handledCallback ( err, ...args ) {
			if ( err ) {
				throw err;
			}
			callback( ...args );
		};
	}

	resolve ( relativePath: string, filename: string ): string {

		const dirname = this.path.dirname( relativePath );

		return this.path.resolve( dirname, filename );

	}

	join ( path, filename ): string {

		return this.path.join( path, filename );

	}
}
