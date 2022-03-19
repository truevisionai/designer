/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { IFile } from '../core/models/file';
import { FileUtils } from './file-utils';
import { SnackBar } from './snack-bar.service';

@Injectable( {
    providedIn: 'root'
} )
export class FileService {

    static electron: ElectronService;

    public fileImported = new EventEmitter<IFile>();
    public fileSaved = new EventEmitter<IFile>();

    public fs: any;
    private path: any;
    private util: any;

    constructor ( public electronService: ElectronService, private ngZone: NgZone ) {

        FileService.electron = electronService;

        if ( this.electronService.isElectronApp ) {

            this.fs = this.electronService.remote.require( 'fs' );
            this.path = this.electronService.remote.require( 'path' );
            this.util = this.electronService.remote.require( 'util' );

        }

    }

    get userDocumentFolder () { return this.electronService.remote.app.getPath( 'documents' ); }

    get currentDirectory () { return this.electronService.ipcRenderer.sendSync( "current-directory" ); }

    get projectFolder () {

        if ( this.electronService.isWindows ) {

            return this.userDocumentFolder + "\\Truevision"

        } else if ( this.electronService.isLinux ) {

            return this.userDocumentFolder + "/Truevision"

        } else {

            throw new Error( "Unsupported platform. Please contact support for more details." );

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

    async showAsyncDialog (): Promise<string[]> {

        const options = {
            title: 'Select file',
            buttonLabel: 'Import',
            filters: [
                {
                    name: null,
                }
            ],
            message: 'Select file'
        };

        return Promise.resolve( this.electronService.remote.dialog.showOpenDialog( null, {} ) );
    }

    async readAsync ( path ) {

        return Promise.resolve( this.fs.readFileSync( path, 'utf-8' ) );

    }

    import ( path?: string, type: string = 'default', extensions = [ 'xml' ], callbackFn: any = null ) {

        if ( !this.electronService.isElectronApp ) throw new Error( 'Error: cannot import' );

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

        this.electronService.remote.dialog.showOpenDialog( null, options, ( filepaths ) => {

            if ( filepaths != null ) this.readFile( filepaths[ 0 ], type, callbackFn );

        } );
    }

    /**
     *
     * @deprecated use import
     */
    importFile ( path?: string, type: string = 'default', extensions = [ 'xml' ] ) {

        this.import( path, type, extensions, null );

    }

    readFile ( path: string, type: string = 'default', callbackFn: any = null ) {

        this.fs.readFile( path, 'utf-8', ( err, data ) => {

            if ( err ) {
                alert( 'An error ocurred reading the file :' + err.message );
                return;
            }

            const file = new IFile();

            file.path = path;
            file.contents = data;
            file.type = type;
            file.updatedAt = new Date()

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

        const options = {
            defaultPath: directory
        };

        this.electronService.remote.dialog.showSaveDialog( null, options, ( fullPath ) => {

            if ( fullPath != null ) {

                // append the extension if not present in the path
                if ( !fullPath.includes( `.${ extension }` ) ) {

                    fullPath = fullPath + "." + extension;

                }

                this.writeFile( fullPath, contents, callbackFn );

            } else {

                console.error( "Could not save file" );

            }

        } );

    }

    saveAsFile ( directory: string = null, contents: string, callbackFn: any = null ): any {

        if ( directory == null ) directory = this.projectFolder;

        const options = {
            defaultPath: directory
        };

        this.electronService.remote.dialog.showSaveDialog( null, options, ( path ) => {

            if ( path != null ) {

                this.writeFile( path, contents, callbackFn );


            } else {

                // alert( "you didnt save file" );

            }

        } );

    }

    writeFile ( filepath, content, callbackFn: any = null ) {

        this.fs.writeFile( filepath, content, ( err, data ) => {

            if ( err ) {

                console.error( 'An error ocurred creating the file ' + err.message );

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

            console.error( "folder does not exists" );

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
            }

        } catch ( error ) {

            // throw new Error( `Error in creating project at ${ path }` );

        }

    }

    createFile ( path: string, name: string = 'New Untitled', extension: string, contents: any ) {

        let slash = null;

        if ( this.electronService.isWindows ) slash = "\\";

        if ( this.electronService.isLinux ) slash = "/";

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

            items.push( this.getItemProperties( itemPath ) );

        } );

        return items;
    }

    getItemProperties ( itemPath ) {

        const stats = this.fs.statSync( itemPath );

        const name = FileService.getFilenameFromPath( itemPath );

        return {
            name: name,
            type: this.getItemType( stats ),
            path: itemPath,
            size: stats.size,
            mtime: stats.mtime
        };

        return new Promise( resolve => {
            this.fs.stat( itemPath, this.handled( stats => resolve( {
                name: itemPath.split( '/' ).pop(),
                type: this.getItemType( stats ),
                path: itemPath,
                size: stats.size,
                mtime: stats.mtime
            } ) ) );
        } );
    }

    static getFilenameFromPath ( path: string ): string {

        return FileUtils.getFilenameFromPath( path );

    }

    getItemType ( item ) {
        if ( item.isFile() ) {
            return 'file';
        } else if ( item.isDirectory() ) {
            return 'directory';
        } else if ( item.isBlockDevice() ) {
            return 'blockdevice';
        } else if ( item.isCharacterDevice() ) {
            return 'characterdevice';
        } else if ( item.isSymbolicLink() ) {
            return 'symlink';
        } else if ( item.isFIFO() ) {
            return 'fifo';
        } else if ( item.isSocket() ) {
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
