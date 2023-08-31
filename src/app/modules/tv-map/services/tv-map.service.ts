/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { SceneExporterService } from 'app/services/scene-exporter.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvElectronService } from 'app/services/tv-electron.service';

import { IFile } from '../../../core/io/file';
import { FileService } from '../../../core/io/file.service';
import { TvMapBuilder } from '../builders/tv-map-builder';
import { TvMap } from '../models/tv-map.model';
import { OpenDriveExporter } from './open-drive-exporter';
import { OpenDriverParser } from './open-drive-parser.service';
import { TvMapInstance } from './tv-map-source-file';

@Injectable( {
	providedIn: 'root'
} )
export class TvMapService {

	constructor (
		public fileService: FileService,
		private openDriveExporter: OpenDriveExporter,
		private electron: TvElectronService,
		private sceneExporter: SceneExporterService,
	) {

		// not reqiured now because open scenario not being used
		// OdSourceFile.roadNetworkChanged.subscribe( ( e ) => {
		// OdBuilder.makeOpenDrive( this.openDrive );
		// } );

	}

	public get map () {
		return TvMapInstance.map;
	}

	public set map ( value ) {
		TvMapInstance.map = value;
	}


	/**
	 * @deprecated
	 */
	async showImportDialog () {

		const res = await this.fileService.showAsyncDialog();

		if ( res.canceled ) return;

		const filepaths = res.filePaths;

		if ( filepaths == null || filepaths.length == 0 ) return;

		SnackBar.show( 'Importing....' );

		try {

			const file = new IFile();

			file.contents = await this.fileService.readAsync( filepaths[ 0 ] );

			file.path = filepaths[ 0 ];

			this.import( file );

		} catch ( e ) {

			SnackBar.error( 'Error while importing' );

			SnackBar.error( e );

		}

	}

	public import ( file: IFile, callbackFn = null ) {

		const map = this.load( file );

		if ( map == null ) return;

		this.map?.destroy();

		this.map = map;

		TvMapBuilder.buildMap( this.map );

		callbackFn?.( map );

		SnackBar.success( `OpenDrive imported ${ file?.path }` );

		TvConsole.info( 'OpenDrive imported ' + file?.path );
	}

	public load ( file: IFile, callbackFn = null ): TvMap {

		return this.parse( file.contents, callbackFn );

	}

	public parse ( contents: string, callbackFn = null ): TvMap {

		let parser = new OpenDriverParser();

		const map = parser.parse( contents );

		if ( map == null ) return;

		if ( callbackFn != null ) callbackFn();

		// Important! removes garbage
		parser = undefined;

		return map;
	}

	public importFromPath ( filepath: string, callbackFn = null ) {

		this.fileService.readFile( filepath, 'xml', ( file: IFile ) => {

			this.import( file, callbackFn );

		} );

	}

	getOpenDriveOutput () {

		return this.openDriveExporter.getOutput( this.map );

	}

	getSceneOutput () {

		return this.sceneExporter.export();

	}

}
