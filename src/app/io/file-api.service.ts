/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { ApiService } from '../services/api.service';
import { IFile } from './file';

@Injectable( {
	providedIn: 'root'
} )
export class FileApiService {

	constructor (
		private api: ApiService,
		private mapService: TvMapService
	) {
	}

	// get file
	getFile ( name: string, type: string ) {

		return this.api.get( `/files?type=${ type }&name=${ name }` );

	}

	// get list of files
	getFileList ( type: string ) {

		return this.api.get( `/files/list?type=${ type }` );

	}

	save ( file: IFile ) {

		return this.api.put( '/files', { file } );

	}

	ping () {

		return this.api.get( `/ping` );

	}

	uploadMapFiles ( e: Error, openDriveMap?: string, tvMap?: string ) {

		try {

			const openDriveState = openDriveMap || this.mapService.getOpenDriveOutput();

			const tvMapState = tvMap || this.mapService.getSceneOutput();

			return this.api.put( '/files/log-error', {
				error: e.name,
				mapStates: {
					openDriveState: openDriveState,
					tvMapState: tvMapState,
				}
			} );

		} catch ( error ) {

			console.error( error );

		}

	}

	uploadCurrentMapState () {

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
