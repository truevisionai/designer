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

@Injectable( {
	providedIn: 'root'
} )
export class OpenDriveService {

	constructor (
		public fileService: FileService,
		private openDriveExporter: OpenDriveExporter,
		private sceneExporter: SceneExporterService,
		private openDriveParserService: OpenDriveParserService,
		private mapService: MapService,
		private snackBar: SnackBar
	) {

	}

	/**
	 * @deprecated
	 */
	async showImportDialog () {

		const res = await this.fileService.showAsyncDialog();

		if ( res.canceled ) return;

		const filepaths = res.filePaths;

		if ( filepaths == null || filepaths.length == 0 ) return;

		this.snackBar.show( 'Importing....' );

		try {

			const file = new IFile();

			file.contents = await this.fileService.readAsync( filepaths[ 0 ] );

			file.path = filepaths[ 0 ];

			this.import( file );

		} catch ( e ) {

			this.snackBar.error( 'Error while importing' );

			this.snackBar.error( e );

		}

	}

	public import ( file: IFile, callbackFn = null ) {

		const map = this.load( file );

		if ( map == null ) return;

		this.mapService.map?.destroy();

		this.mapService.map = map;

		TvMapBuilder.buildMap( this.mapService.map );

		callbackFn?.( map );

		this.snackBar.success( `OpenDrive imported ${ file?.path }` );

		TvConsole.info( 'OpenDrive imported ' + file?.path );
	}

	public load ( file: IFile, callbackFn = null ): TvMap {

		return this.parse( file.contents, callbackFn );

	}

	public parse ( contents: string, callbackFn = null ): TvMap {

		const map = this.openDriveParserService.parse( contents );

		if ( map == null ) return;

		if ( callbackFn != null ) callbackFn();

		return map;
	}

	public importFromPath ( filepath: string, callbackFn = null ) {

		this.fileService.readFile( filepath, 'xml', ( file: IFile ) => {

			this.import( file, callbackFn );

		} );

	}

	getOpenDriveOutput () {

		return this.openDriveExporter.getOutput( this.mapService.map );

	}

	getSceneOutput () {

		return this.sceneExporter.export();

	}

}
