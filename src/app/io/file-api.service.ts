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

			return this.api.put( '/files/log-error', {
				error: e?.name || 'UnknownError',
				mapStates: {
					openDriveState: openDriveState,
					tvMapState: tvMapState,
				}
			} );

		} catch ( error ) {

			console.error( error );

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
}
