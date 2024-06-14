/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { SceneExporter } from 'app/map/scene/scene.exporter';
import { SnackBar } from 'app/services/snack-bar.service';
import { IFile } from '../../io/file';
import { FileService } from '../../io/file.service';
import { TvMapBuilder } from '../builders/tv-map-builder';
import { TvMap } from '../models/tv-map.model';
import { OpenDriveExporter } from './open-drive-exporter';
import { OpenDriveParserService } from "../../importers/open-drive/open-drive-parser.service";
import { MapService } from 'app/services/map/map.service';
import { StorageService } from 'app/io/storage.service';
import { SceneService } from 'app/services/scene.service';
import { MapEvents } from 'app/events/map-events';

@Injectable( {
	providedIn: 'root'
} )
export class OpenDriveService {

	constructor (
		private fileService: FileService,
		private storage: StorageService,
		private openDriveExporter: OpenDriveExporter,
		private sceneExporter: SceneExporter,
		private openDriveParserService: OpenDriveParserService,
		private mapService: MapService,
		private snackBar: SnackBar,
		private mapBuilder: TvMapBuilder,
	) {

	}

	/**
	 * @deprecated
	 */
	async showImportDialog () {

		const response = await this.fileService.showAsyncDialog();

		if ( response.canceled ) return;

		if ( response.filePaths == null || response.filePaths.length == 0 ) return;

		const filepaths = response.filePaths;

		if ( filepaths == null || filepaths.length == 0 ) return;

		this.snackBar.show( 'Importing....' );

		try {

			const file = new IFile();

			file.contents = await this.storage.readAsync( filepaths[ 0 ] );

			file.path = filepaths[ 0 ];

			this.import( file.path, file.contents );

		} catch ( e ) {

			this.snackBar.error( 'Error while importing' );

			this.snackBar.error( e );

		}

	}

	public import ( path, contents, callbackFn = null ) {

		const old = this.mapService.map;

		const map = this.parse( contents );

		if ( map == null ) return;

		old?.destroy();

		MapEvents.mapRemoved.emit( old );

		SceneService.removeFromMain( old.gameObject );

		map.gameObject = this.mapBuilder.build( map );

		SceneService.addToMain( map.gameObject );

		callbackFn?.( map );

		this.snackBar.success( `OpenDrive imported ${ path }` );

		TvConsole.info( 'OpenDrive imported ' + path );

		this.mapService.map = map;

		// this.sceneBuilder.buildScene( map );

	}


	parse ( contents: string, ): TvMap {

		return this.openDriveParserService.parse( contents );

	}

	importFromPath ( filepath: string, callbackFn = null ) {

		const contents = this.storage.readSync( filepath );

		this.import( filepath, contents, callbackFn );

	}

	getOpenDriveOutput () {

		return this.openDriveExporter.getOutput( this.mapService.map );

	}

	getSceneOutput () {

		return this.sceneExporter.exportAsString();

	}

}
