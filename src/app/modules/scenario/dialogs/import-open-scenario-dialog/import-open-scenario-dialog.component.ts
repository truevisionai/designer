/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MetadataFactory } from 'app/core/factories/metadata-factory.service';
import { FileService } from 'app/services/file.service';
import { FileUtils } from '../../../../services/file-utils';
import { TvScenario } from '../../models/tv-scenario';
import { OpenScenarioImporter } from '../../services/open-scenario-importer.service';

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
		private openScenarioImporter: OpenScenarioImporter,
		private fileService: FileService,
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
		return this.fileService.join( this.destinationDirectory, this.sourceFilenameWithoutExtension );
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

		console.log( this.data );

		this.scenario = await this.openScenarioImporter.readFromPath( this.data.path );

		console.log( this.scenario );

	}

	import () {

		this.importRoadNetwork();

		this.importScenario();

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

		MetadataFactory.createFolderMetadata( this.newSubDirectory );
		MetadataFactory.createFolderMetadata( destinationDir );
		MetadataFactory.createMetadataFormPath( destinationPath );

	}

	private importScenario () {

		this.importRoadNetwork();

		this.fileService.fs.copyFileSync( this.data.path, this.scenarioFileDestination );

		MetadataFactory.createMetadataFormPath( this.scenarioFileDestination );

	}


}
