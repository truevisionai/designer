/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { SceneExporterService } from 'app/services/scene-exporter.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvElectronService } from 'app/services/tv-electron.service';

import { saveAs } from 'file-saver';

import { IFile } from '../../../core/models/file';
import { FileService } from '../../../services/file.service';
import { TvMapBuilder } from '../builders/tv-map-builder';
import { OpenDriverParser } from './open-drive-parser.service';
import { OdWriter } from './open-drive-writer.service';
import { TvMapInstance } from './tv-map-source-file';

@Injectable( {
	providedIn: 'root'
} )
export class TvMapService {

	constructor (
		private fileService: FileService,
		private writer: OdWriter,
		private electron: TvElectronService,
		private sceneExporter: SceneExporterService,
	) {

		// not reqiured now because open scenario not being used
		// OdSourceFile.roadNetworkChanged.subscribe( ( e ) => {
		// OdBuilder.makeOpenDrive( this.openDrive );
		// } );

	}

	public get currentFile () {
		return TvMapInstance.currentFile;
	}

	public set currentFile ( value ) {
		TvMapInstance.currentFile = value;
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

			TvConsole.error( e );

		}

	}

	public import ( file: IFile, callbackFn = null ) {

		const map = this.load( file, callbackFn );

		if ( map == null ) return;

		this.map = map;

		TvMapBuilder.buildMap( this.map );

		SnackBar.success( `OpenDrive imported ${ file?.path }` );

		TvConsole.info( 'OpenDrive imported ' + file?.path );
	}

	public load ( file: IFile, callbackFn = null ) {

		return this.parse( file.contents, callbackFn );

	}

	public parse ( contents: string, callbackFn = null ) {

		let parser = new OpenDriverParser();

		const map = parser.parse( contents );

		if ( map == null ) return;

		this.map = map;

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

	public importContent ( contents: string ) {

		const file = new IFile();

		file.name = 'Untitled.xml';
		file.contents = contents;

		this.import( file );

	}

	/**
	 * @deprecated
	 */
	save () {

		if ( this.currentFile == null ) {

			throw new Error( 'Create file before saving' );

		}

		this.currentFile.contents = this.writer.getOutput( this.map );

		this.saveLocally( this.currentFile );

	}

	getOpenDriveOutput () {

		return this.writer.getOutput( this.map );

	}

	getSceneOutput () {

		return this.sceneExporter.export();

	}

	/**
	 *
	 * @deprecated
	 * @param file
	 */
	saveLocally ( file: IFile ) {

		// path exists means it was imported locally
		if ( this.currentFile.path != null ) {

			this.fileService.saveFile( file.path, file.contents, ( file: IFile ) => {

				this.currentFile.path = file.path;
				this.currentFile.name = file.name;

				SnackBar.success( 'File Saved!' );

			} );

		} else {

			this.saveAs();

		}
	}

	saveLocallyAt ( path: string ) {

		const contents = this.getOpenDriveOutput();

		this.fileService.saveFile( path, contents, ( file: IFile ) => {

			this.currentFile.path = file.path;
			this.currentFile.name = file.name;

		} );
	}

	saveAs () {

		const contents = this.writer.getOutput( this.map );

		if ( this.electron.isElectronApp ) {

			this.fileService.saveFileWithExtension( null, contents, 'xodr', ( file: IFile ) => {

				this.currentFile.path = file.path;
				this.currentFile.name = file.name;

				SnackBar.success( `File saved ${ file.path }` );

			} );

		} else {

			saveAs( new Blob( [ contents ] ), 'road.xodr' );

		}

	}
}
