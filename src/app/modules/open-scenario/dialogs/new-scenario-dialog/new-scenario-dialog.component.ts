import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IFile } from 'app/core/models/file';
import { FileApiService } from 'app/core/services/file-api.service';
import { FileService } from 'app/services/file.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { OscService } from '../../services/osc.service';

@Component( {
	selector: 'app-new-scenario-dialog',
	templateUrl: './new-scenario-dialog.component.html',
	styleUrls: [ './new-scenario-dialog.component.css' ]
} )
export class NewScenarioDialogComponent implements OnInit {

	isCreatingNew = false;

	constructor (
		private dialogRef: MatDialogRef<NewScenarioDialogComponent>,
		private osc: OscService,
		private fileApiService: FileApiService,
		private electron: TvElectronService,
		private fileService: FileService
	) {
	}

	ngOnInit () {
	}

	createNew () {

		this.osc.newFile();

		this.osc.saveAs();

		this.isCreatingNew = true;
	}

	selectRoadNetwork () {

		// this.fileService.import( null, 'tv-map', [ 'xml', 'xodr' ], ( file: IFile ) => {

		// 	this.osc.scenario.setRoadNetworkPath( file.path );

		// 	this.osc.rebuild();

		// 	this.dialogRef.close();

		// } );


	}

	openFromComputer () {

		this.osc.openFile();

		this.dialogRef.close();

	}

	openDemo () {

		this.fileApiService.getFile( 'open-scenario.xml', 'open-scenario' )

			.subscribe( ( file: IFile ) => {

				this.dialogRef.close();

				this.osc.import( file );

			} );

	}

}
