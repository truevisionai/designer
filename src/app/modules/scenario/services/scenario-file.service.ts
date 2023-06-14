/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Debug } from 'app/core/utils/debug';
import { TvElectronService } from 'app/services/tv-electron.service';

import { saveAs } from 'file-saver';
import { IFile } from '../../../core/models/file';
import { OpenScenarioApiService } from '../../../core/services/open-scenario-api.service';
import { FileService } from '../../../services/file.service';
import { SnackBar } from '../../../services/snack-bar.service';
import { BuilderService } from '../builders/tv-builder.service';
import { OpenScenario } from '../models/tv-scenario';
import { ScenarioDirectorService } from './scenario-director.service';
import { ReaderService } from './tv-reader.service';
import { TvScenarioInstance } from './tv-scenario-instance';
import { WriterService } from './tv-writer.service';

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioFileService {

	constructor (
		private reader: ReaderService,
		private writer: WriterService,
		private builder: BuilderService,
		private fileService: FileService,
		private openScenarioApi: OpenScenarioApiService,
		private electron: TvElectronService,
		private oscPlayer: ScenarioDirectorService
	) {

		TvScenarioInstance.scenarioChanged.subscribe( scenario => {

			// Debug.log( 'scenerio changed' );
			// this.builder.build( road, SourceFile.file );

		} );

	}

	get currentFile () {
		return TvScenarioInstance.currentFile;
	}

	set currentFile ( value ) {
		TvScenarioInstance.currentFile = value;
	}

	get scenario () {
		return TvScenarioInstance.scenario;
	}

	set scenario ( value ) {
		TvScenarioInstance.scenario = value;
	}

	rebuild () {

		// TODO: Clear old scene

		this.builder.build( this.scenario, this.currentFile );

	}

	newFile () {

		this.currentFile = new IFile( 'untitled.xml' );

		this.scenario = new OpenScenario();

	}

	openFile () {

		// this.fileService.import( null, 'osc', [ 'xml', 'xosc' ], ( file: IFile ) => {

		// 	this.import( file );

		// } );


	}

	import ( file: IFile ) {

		this.currentFile = file;

		SnackBar.show( 'Building Scenario' );

		this.scenario = this.reader.readFromFile( file );

		this.builder.build( this.scenario, file );
	}

	importFromPath ( filepath: string ) {

		this.fileService.readFile( filepath, 'xml', ( file: IFile ) => {

			this.import( file );

		} );

	}

	importFromContent ( contents: string ) {

		const file = new IFile();

		file.name = 'Untitled.xml';
		file.contents = contents;
		file.online = false;

		this.import( file );
	}

	save ( callback?: ( file: IFile ) => void ) {

		const fileDoesNotExist = this.currentFile == null || this.currentFile.path == null;

		if ( fileDoesNotExist ) {

			this.saveAs( callback );

		} else {

			SnackBar.show( 'Saving...' );

			const content = this.writer.getOutputString( this.scenario );

			if ( this.currentFile.online ) {

				this.saveOnline( content );

			} else {

				this.saveLocally( content, callback );

			}
		}
	}

	saveAs ( callback?: ( file: IFile ) => void ) {

		const contents = this.writer.getOutputString( TvScenarioInstance.scenario );

		Debug.log( contents );

		if ( this.electron.isElectronApp ) {

			this.fileService.saveAsFile( null, contents, ( file: IFile ) => {

				if ( this.currentFile == null ) {

					this.currentFile = new IFile( file.name, file.path );

				} else {

					this.currentFile.path = file.path;
					this.currentFile.name = file.name;

				}

				if ( callback ) callback( file );

			} );

		} else {

			saveAs( new Blob( [ contents ] ), 'scenario.xosc' );

		}

	}

	saveLocallyAt ( path, callback?: ( file: IFile ) => void ) {

		const contents = this.writer.getOutputString( TvScenarioInstance.scenario );

		this.fileService.saveFile( path, contents, ( file: IFile ) => {

			if ( this.currentFile == null ) {

				this.currentFile = new IFile( file.name, file.path );

			} else {

				this.currentFile.path = file.path;
				this.currentFile.name = file.name;

			}

			if ( callback ) callback( file );

		} );
	}

	private saveOnline ( content: string ) {

		const tmpFile = new IFile( this.currentFile.name, this.currentFile.path, content, this.currentFile.type, true );

		this.openScenarioApi.saveOpenScenario( tmpFile ).subscribe( res => {

			SnackBar.show( 'Successfully saved online' );

		} );

	}

	private saveLocally ( content: string, callback?: ( file: IFile ) => void ) {

		this.saveLocallyAt( TvScenarioInstance.currentFile.path, callback );

	}
}
