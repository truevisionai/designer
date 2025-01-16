/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { OpenDriveService } from 'app/map/services/open-drive.service';
import { ApiService } from '../services/api.service';
import { IFile } from './file';
import { Observable } from 'rxjs';

@Injectable( {
	providedIn: 'root'
} )
export class FileApiService {

	constructor (
		private api: ApiService,
		private mapService: OpenDriveService
	) {
	}

	// get file
	getFile ( name: string, type: string ): Observable<any> {

		return this.api.get( `/files?type=${ type }&name=${ name }` );

	}

	// get list of files
	getFileList ( type: string ): Observable<any> {

		return this.api.get( `/files/list?type=${ type }` );

	}

	save ( file: IFile ): Observable<any> {

		return this.api.put( '/files', { file } );

	}

	ping (): Observable<any> {

		return this.api.get( `/ping` );

	}

	uploadMapFiles ( e: Error, openDriveMap?: string, tvMap?: string ): Observable<any> {

		try {

			const openDriveState = openDriveMap || this.mapService.getOpenDriveOutput();

			const tvMapState = tvMap || this.mapService.getSceneOutput();

			// Check file size before uploading
			if ( this.isExceedingMaxFileSize( openDriveState, tvMapState ) ) {
				return new Observable( observer => {
					observer.error( 'File size exceeds 1MB' );
				} );
			}

			return this.api.put( '/files/log-error', {
				error: e?.name || 'UnknownError',
				mapStates: {
					openDriveState: openDriveState,
					tvMapState: tvMapState,
				}
			} );

		} catch ( error ) {

			console.error( error );

			// Return a failed observable in case of errors
			return new Observable( observer => {
				observer.error( error );
			} );

		}

	}

	uploadCurrentMapState (): Observable<any> {

		const openDriveState = this.mapService.getOpenDriveOutput();
		const tvMapState = this.mapService.getSceneOutput();

		return this.api.put( '/files/log-error', {
			mapStates: {
				openDriveState: openDriveState,
				tvMapState: tvMapState,
			}
		} );

	}

	isExceedingMaxFileSize ( openDriveState: string, tvMapState: string ): boolean {

		// Measure size in bytes
		const encoder = new TextEncoder();
		const openDriveStateSize = encoder.encode( openDriveState ).length;
		const tvMapStateSize = encoder.encode( tvMapState ).length;

		const size = openDriveStateSize + tvMapStateSize;
		const maxSize = 1000000; // 10MB

		return size >= maxSize;

	}

}
