/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ApplicationRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MetadataFactory } from 'app/factories/metadata-factory.service';
import { FileService } from 'app/io/file.service';
import { TvConsole } from 'app/core/utils/console';
import { FileUtils } from '../../../../io/file-utils';
import { Catalog } from '../../models/tv-catalogs';
import { TvScenario } from '../../models/tv-scenario';
import { OpenScenarioLoader } from '../../services/open-scenario.loader';

export class ImportOpenScenarioDialogData {
	constructor ( public path: string, public destinationPath: string, public extension: string ) {
	}
}

@Component( {
	selector: 'app-import-open-scenario-dialog',
	templateUrl: './import-open-scenario-dialog.component.html',
	styleUrls: [ './import-open-scenario-dialog.component.scss' ]
} )
export class ImportOpenScenarioDialogComponent implements OnInit {

	scenario: TvScenario;

	constructor (
		private dialogRef: MatDialogRef<ImportOpenScenarioDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: ImportOpenScenarioDialogData,
		private openScenarioImporter: OpenScenarioLoader,
		private fileService: FileService,
		private appRef: ApplicationRef
	) {
	}

	get sourceDirectory (): string {
		return FileUtils.getDirectoryFromPath( this.data.path );
	}

	get sourceFilename (): string {
		return FileUtils.getFilenameFromPath( this.data.path );
	}

	get sourceFilenameWithoutExtension (): string {
		return this.sourceFilename.replace( '.' + this.data.extension, '' );
	}

	get destinationDirectory (): string {
		return this.data.destinationPath.substring( 0, this.data.destinationPath.lastIndexOf( '/' ) );
	}

	get newSubDirectory (): string {
		return this.destinationDirectory;
	}

	get roadNetworkSource (): string {
		return this.fileService.join( this.sourceDirectory, this.scenario.roadNetwork.logics.filepath );
	}

	get scenarioFileName () {
		return FileUtils.getFilenameFromPath( this.data.path );
	}

	get scenarioFileDestination () {
		return this.fileService.join( this.newSubDirectory, this.scenarioFileName );
	}

	async ngOnInit (): Promise<void> {

		if ( !this.data?.path ) TvConsole.error( 'No path provided' );

		if ( !this.data?.path ) return;

		TvConsole.info( 'Reading scenarion from ' + this.data?.path );

		this.readScenario();

	}

	async readScenario () {

		try {

			const scenario = await this.openScenarioImporter.loadPath( this.data.path );

			if ( !scenario.roadNetwork?.logics?.filepath ) {

				TvConsole.error( 'No map file found for scenario' );

			} else {

				this.scenario = scenario;

			}

		} catch ( error ) {

			TvConsole.error( 'Error in reading scenario file' );
			TvConsole.error( error );

		}

	}

	import () {

		if ( !this.scenario ) return;

		this.importRoadNetwork();

		this.importScenario();

		const catalogs = this.fileService.join( this.sourceDirectory, 'Catalogs' );

		this.fileService.copyDirSync( catalogs, this.fileService.join( this.newSubDirectory, 'Catalogs' ) );

		this.dialogRef.close( this.newSubDirectory );

		this.appRef.tick();

	}

	copyCatalogs () {

		this.scenario.catalogs.getCatalogs().forEach( catalog => {

			this.importCatalog( catalog );

		} );

	}

	importCatalog ( catalog: Catalog ) {

		if ( !catalog.directory?.path ) TvConsole.error( 'No path found for catalog ' + catalog.name + ' ' + catalog.catalogType );
		if ( !catalog.directory?.path ) return;

		// const sourceDirectory = this.fileService.join( this.sourceDirectory, catalog.directory.path );

		this.fileService.copyDirSync( 'Catalogs', this.newSubDirectory );

		// const files: IFile[] = this.fileService.readPathContentsSync( sourceDirectory );

		// files.filter( file => file.type == 'file' && FileService.getExtension( file.name ) === 'xosc' )

		// 	.forEach( file => {

		// 		let destinationPath = this.fileService.join( this.newSubDirectory, file.name );

		// 		// destinationPath = this.fileService.join( destinationPath, file.name );

		// 		this.fileService.fs.copyFileSync( file.path, destinationPath );

		// 	} )
	}

	private importRoadNetwork (): void {

		const destinationPath = this.fileService.join( this.newSubDirectory, this.scenario.roadNetwork.logics.filepath );

		// Get the directory path of the destination file
		const destinationDir = this.fileService.path.dirname( destinationPath );

		// Check if the directory exists
		if ( !this.fileService.fs.existsSync( destinationDir ) ) {
			// Create the directory if it doesn't exist
			this.fileService.fs.mkdirSync( destinationDir, { recursive: true } );
		}

		this.fileService.fs.copyFileSync( this.roadNetworkSource, destinationPath );

		// MetadataFactory.createFolderMetadata( this.newSubDirectory );
		// MetadataFactory.createFolderMetadata( destinationDir );
		MetadataFactory.createMetadataFormPath( destinationPath );

	}

	private importScenario () {

		this.fileService.fs.copyFileSync( this.data.path, this.scenarioFileDestination );

		MetadataFactory.createMetadataFormPath( this.scenarioFileDestination );

	}


}
