/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SnackBar } from '../services/snack-bar.service';
import { TvElectronService } from '../services/tv-electron.service';

import { IFile } from './file';
import { FileUtils } from './file-utils';
import { TvConsole } from 'app/core/utils/console';

declare const versions;

@Injectable( {
	providedIn: 'root'
} )
export class FileService {

	public fs: any;
	public path: any;

	constructor (
		private electronService: TvElectronService,
		private snackBar: SnackBar
	) {

		if ( this.electronService.isElectronApp ) {
			this.fs = versions.fs();
			this.path = this.remote.require( 'path' );
		}

	}

	get remote () {
		return this.electronService.remote;
	}

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

	/**
	 * @deprecated
	 */
	async showAsyncDialog (): Promise<Electron.OpenDialogReturnValue> {

		const options = {
			title: 'Select file',
			buttonLabel: 'Import',
			filters: [
				{ name: 'xodr', extensions: [ 'xodr' ] },
				{ name: 'xml', extensions: [ 'xml' ] },
			],
			message: 'Select file'
		};

		return this.remote.dialog.showOpenDialog( options );
	}

	async readAsync ( path: string, encoding = 'utf-8' ): Promise<any> {

		return Promise.resolve( this.fs.readFileSync( path, encoding ) );

	}

	async writeAsync ( path: string, data, options ): Promise<any> {

		return Promise.resolve( this.fs.writeFileSync( path, data, options ) );

	}

	async readAsArrayBuffer ( path ): Promise<any> {

		const data = this.fs.readFileSync( path, null );

		// If no encoding is specified, return data as ArrayBuffer
		const arrayBuffer = Uint8Array.from( data ).buffer;

		return Promise.resolve( arrayBuffer );
	}

	saveFileWithExtension ( directory: string = null, contents: string, extension: string, callbackFn: any = null ) {

		if ( directory == null ) directory = this.projectFolder;

		// const filename = 'Untitled.' + extension

		// const defaultPath = this.path.join( directory, filename );

		const saveOptions: Electron.SaveDialogOptions = {
			title: 'Save File',
			defaultPath: directory,
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

				this.snackBar.error( 'Could not save file' );

			}

		} );

	}

	writeFile ( filepath, content, callbackFn: any = null ) {

		this.fs.writeFile( filepath, content, ( err, data ) => {

			if ( err ) {

				console.error( 'Error in writing file ', err );

				return;

			} else {

				const name = FileUtils.getFilenameFromPath( filepath );

				const file = new IFile( name, filepath, content, null, null, new Date() );

				if ( callbackFn != null ) callbackFn( file );

			}

		} );

	}

	deleteFolderRecursive ( folderPath ) {

		if ( this.fs.existsSync( folderPath ) ) {

			this.fs.readdirSync( folderPath ).forEach( ( item ) => {

				const itemPath = this.path.join( folderPath, item );

				if ( versions.stat.isDirectory( itemPath ) ) {

					this.deleteFolderRecursive( itemPath );

				} else {

					this.fs.unlinkSync( itemPath );
				}

			} );

			this.fs.rmdirSync( folderPath );
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

		let fileName = name;
		let filePath = this.join( path, `${ fileName }.${ extension }` );

		let count = 1;

		while ( this.fs.existsSync( filePath ) ) {
			fileName = `${ name }(${ count++ })`;
			filePath = this.join( path, `${ fileName }.${ extension }` );
		}

		this.fs.writeFileSync( filePath, contents );

		return { fileName, filePath };
	}

	readPathContentsSync ( dirpath ) {

		let files = [];

		try {

			files = this.fs.readdirSync( dirpath )

		} catch ( error ) {

			TvConsole.error( error );

			return [];

		}

		const items = [];

		files.forEach( file => {

			// Ignore hidden files (starting with '.')
			if ( file.startsWith( '.' ) ) {
				return;
			}

			const itemPath = this.path.join( dirpath, file );

			const itemWithProperites = this.getItemProperties( itemPath );

			items.push( itemWithProperites );

		} );

		return items;
	}

	getItemProperties ( itemPath ) {

		const stats = this.fs.statSync( itemPath );

		const name = FileUtils.getFilenameFromPath( itemPath );

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

	join ( path, filename ): string {

		return this.path.join( path, filename );

	}

	copyDirSync ( source: string, destination: string ) {

		if ( !this.fs.existsSync( destination ) ) {
			this.fs.mkdirSync( destination, { recursive: true } );
		}

		const items = this.fs.readdirSync( source, { withFileTypes: true } );

		for ( const item of items ) {

			const itemPath = this.path.join( source, item.name );

			const sourcePath = this.path.join( source, item.name );

			const destinationPath = this.path.join( destination, item.name );

			if ( versions.stat.isDirectory( itemPath ) ) {

				this.copyDirSync( sourcePath, destinationPath );

			} else if ( versions.stat.isFile( itemPath ) ) {

				this.fs.copyFileSync( sourcePath, destinationPath );
			}
		}
	}

}
