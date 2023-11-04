/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { IFile } from '../io/file';
import { FileService } from '../io/file.service';
import { StorageService } from './storage.service';

@Injectable( {
	providedIn: 'root'
} )
export class RecentFileService {

	private readonly LAST_OPENED_FILE = 'current_file';
	private readonly RECENT_FILES = 'recent_files';

	private mRecentFiles: IFile[] = [];
	private mLastFile: IFile;

	constructor (
		private storage: StorageService,
		private files: FileService
	) {

		this.loadStorageData();

		this.files.fileImported.subscribe( ( file: IFile ) => this.addToRecentFiles( file ) );

		this.files.fileSaved.subscribe( ( file: IFile ) => this.addToRecentFiles( file ) );

	}

	get lastOpenedFile (): IFile {

		return this.mLastFile;

	}

	get currentFile (): IFile {

		return this.mLastFile;

	}

	set currentFile ( file: IFile ) {

		this.mLastFile = file;

		this.saveLastOpenedFile();

	}

	get recentFiles (): IFile[] {

		return this.mRecentFiles.reverse();

	}

	addToRecentFiles ( file: IFile ): void {

		this.currentFile = file;

		if ( !this.fileExists( file ) ) this.mRecentFiles.push( file );

		this.saveRecentFiles();

	}

	addPathToRecentFiles ( path: string ) {

		this.mRecentFiles.push( new IFile( null, path ) );

		this.saveRecentFiles();
	}

	private saveLastOpenedFile (): void {

		this.storage.store( this.LAST_OPENED_FILE, JSON.stringify( this.currentFile ) );

	}

	private loadStorageData (): void {

		this.loadLastFileFromStorage();
		this.loadRecentFilesFromStorage();

	}

	private loadLastFileFromStorage (): void {

		var jsonString = this.storage.get( this.LAST_OPENED_FILE );

		if ( jsonString != null ) {

			this.mLastFile = JSON.parse( jsonString );
		}
	}

	private loadRecentFilesFromStorage (): void {

		var jsonString = this.storage.get( this.RECENT_FILES );

		if ( jsonString != null ) {

			try {

				const files = JSON.parse( jsonString );

				files.forEach( file => {
					this.mRecentFiles.push( new IFile( file.name, file.path, file.contents, file.type, file.online, file.updatedAt ) );
				} );

			} catch ( error ) {

				console.error( error );

			}

		} else {

			this.saveRecentFiles();
		}

	}

	private saveRecentFiles (): void {

		this.storage.store( this.RECENT_FILES, JSON.stringify( this.mRecentFiles ) );

	}

	private fileExists ( find: IFile ): boolean {

		if ( this.recentFiles.findIndex( file => file.path === find.path ) == -1 ) {

			return false;

		} else {

			return true;

		}

	}
}
