/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ScenarioService } from 'app/modules/scenario/services/scenario.service';
import { OpenDriveService } from 'app/modules/tv-map/services/open-drive.service';
import { SceneImporterService } from './scene-importer.service';
import { StorageService } from 'app/io/storage.service';
import { MapService } from 'app/services/map.service';

@Injectable( {
	providedIn: 'root'
} )
export class ImporterService {

	/**
	 * This class is responsible for importing all supported files
	 **/
	constructor (
		private storageService: StorageService,
		private openDriveService: OpenDriveService,
		private sceneImporter: SceneImporterService,
		private scenarioService: ScenarioService,		// dont remove required for import
		private mapService: MapService,
	) {
	}

	async importOpenScenario ( path: string ) {

		await this.scenarioService.importScenario( path );

	}

	async importScene ( path: string ) {

		const contents = await this.storageService.readAsync( path, );

		const map = this.sceneImporter.import( contents );

		// TODO: pass this to builder

		this.mapService.map = map;

	}

	importOpenDrive ( filepath: string ) {

		this.openDriveService.importFromPath( filepath );

	}

}
