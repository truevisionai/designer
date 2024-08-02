/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvElectronService } from 'app/services/tv-electron.service';
import { FileService } from './file.service';
import { AppInfo } from 'app/services/app-info.service';


export interface PutFileResponse {
	path: string;
}

export interface IStorageProvider {

	exists ( path: string ): boolean;

	readAsync ( path: string, options?: any ): Promise<string>;

	readSync ( path: string, options?: any ): string;

	writeSync ( path: string, contents: any, options?: any ): PutFileResponse;

	writeAsync ( path: string, contents: string, options?: any ): Promise<PutFileResponse>;

}

@Injectable( {
	providedIn: 'root'
} )
export class StorageService {

	public static instance?: StorageService;

	private storageProvider: IStorageProvider;

	constructor ( electron: TvElectronService, private fileService: FileService ) {

		if ( electron.isElectronApp ) {

			this.storageProvider = new ElectronStorageProvider( fileService );

			StorageService.instance = this;

		} else {

			// console.error( 'StorageService is only available in Electron' );

		}

	}

	appendFileSync ( path: string, contents: string, options?: any ) {

		return this.fileService.fs.appendFileSync( path, contents, options );

	}

	createDirectory ( path: string, name: string ): PutFileResponse {

		return this.fileService.createFolder( path, name );

	}

	readAsync ( path: string, options?: any ): Promise<string> {

		return this.storageProvider.readAsync( path, options );

	}

	readSync ( path: string, options?: any ): string {

		return this.storageProvider.readSync( path, options );

	}

	writeAsync ( path: string, contents: string, options?: any ): Promise<PutFileResponse> {

		return this.storageProvider.writeAsync( path, contents, options );

	}

	writeSync ( path: string, contents: any, options?: any ): PutFileResponse {

		return this.storageProvider.writeSync( path, contents, options );

	}

	getDirectoryFiles ( path: string ) {

		return this.fileService.readPathContentsSync( path );

	}

	exists ( path: any ): boolean {

		return this.storageProvider.exists( path );

	}

	join ( path: string, filename: string ): string {

		try {

			return this.fileService.path.join( path, filename );

		} catch ( error ) {

			console.error( 'Error in join', error );

			if ( !path ) {
				return filename;
			}

			if ( !filename ) {
				return path;
			}

			if ( AppInfo.electron.isWindows ) {
				return path + '\\' + filename;
			}

			return path + '/' + filename;

		}

	}

	resolve ( appPath: any, arg1: string ): any {

		return this.fileService.path.resolve( appPath, arg1 );

	}

	copyFileSync ( sourcePath: string, destinationPath: string ): PutFileResponse {

		try {

			return this.fileService.fs.copyFileSync( sourcePath, destinationPath );

		} catch ( error ) {

			console.error( error );

			return null;

		}

	}

	renameSync ( oldPath: string, newPath: string ): PutFileResponse {

		return this.fileService.fs.renameSync( oldPath, newPath );

	}

	deleteFileSync ( path: string ) {

		return this.fileService.deleteFileSync( path );

	}

	deleteFolderSync ( path: string ) {

		return this.fileService.deleteFolderRecursive( path );

	}

}

export class ElectronStorageProvider implements IStorageProvider {

	constructor (
		private fileService: FileService
	) {
	}

	readAsync ( path: string, options: any ): Promise<string> {

		const encoding = options?.encoding || 'utf-8';

		return this.fileService.readAsync( path, encoding );

	}

	readSync ( path: string, options?: any ): string {

		const encoding = options?.encoding || 'utf-8';

		return this.fileService.fs.readFileSync( path, encoding );
	}

	writeSync ( path: string, contents: string, options: any ): PutFileResponse {

		return this.fileService.fs.writeFileSync( path, contents, options );

	}

	writeAsync ( path: string, contents: string, options: any ): Promise<PutFileResponse> {

		return this.fileService.writeAsync( path, contents, options );

	}

	exists ( path: string ): boolean {

		return this.fileService.fs.existsSync( path );

	}

}
