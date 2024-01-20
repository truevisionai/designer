/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { SceneExporterService } from 'app/exporters/scene-exporter.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { IFile } from '../../../io/file';
import { FileService } from '../../../io/file.service';
import { TvMapBuilder } from '../builders/tv-map-builder';
import { TvMap } from '../models/tv-map.model';
import { OpenDriveExporter } from './open-drive-exporter';
import { OpenDriveParserService } from "../../../importers/open-drive/open-drive-parser.service";
import { MapService } from 'app/services/map.service';
import { StorageService } from 'app/io/storage.service';
import { DialogService } from 'app/services/dialog/dialog.service';

@Injectable( {
	providedIn: 'root'
} )
export class OpenDriveService {

	constructor (
		private fileService: FileService,
		private storage: StorageService,
		private openDriveExporter: OpenDriveExporter,
		private sceneExporter: SceneExporterService,
		private openDriveParserService: OpenDriveParserService,
		private mapService: MapService,
		private snackBar: SnackBar,
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

		const map = this.load( path, contents );

		if ( map == null ) return;

		this.mapService.map?.destroy();

		this.mapService.map = map;

		TvMapBuilder.buildMap( this.mapService.map );

		callbackFn?.( map );

		this.snackBar.success( `OpenDrive imported ${ path }` );

		TvConsole.info( 'OpenDrive imported ' + path );
	}

	public load ( path, contents, callbackFn = null ): TvMap {

		return this.parse( contents, callbackFn );

	}

	public parse ( contents: string, callbackFn = null ): TvMap {

		const map = this.openDriveParserService.parse( contents );

		if ( map == null ) return;

		if ( callbackFn != null ) callbackFn();

		return map;
	}

	public importFromPath ( filepath: string, callbackFn = null ) {

		const contents = this.storage.readSync( filepath );

		this.import( filepath, contents, callbackFn );

	}

	getOpenDriveOutput () {

		return this.openDriveExporter.getOutput( this.mapService.map );

	}

	getSceneOutput () {

		return this.sceneExporter.export();

	}

}
