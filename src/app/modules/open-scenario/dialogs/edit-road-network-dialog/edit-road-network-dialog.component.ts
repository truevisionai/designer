/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Debug } from 'app/core/utils/debug';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { FileService } from 'app/services/file.service';
import { IFile } from '../../../../core/models/file';
import { OpenDriveApiService } from '../../../../core/services/open-drive-api.service';
import { File } from '../../models/osc-common';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';

@Component( {
	selector: 'app-edit-road-network-dialog',
	templateUrl: './edit-road-network-dialog.component.html',
	styleUrls: [ './edit-road-network-dialog.component.css' ]
} )
export class EditRoadNetworkDialogComponent implements OnInit {

	public selectedRoadNetwork: any;
	public files: any[] = [];
	public file: IFile;

	constructor (
		public dialogRef: MatDialogRef<any>,
		@Inject( MAT_DIALOG_DATA ) public data: any,
		private fileService: FileService,
		private openDriveApi: OpenDriveApiService,
		private openDriveService: TvMapService
	) {
	}

	get openScenario () {
		return TvScenarioInstance.openScenario;
	}

	get roadNetwork () {
		return TvScenarioInstance.openScenario.roadNetwork;
	}

	get logics () {
		return TvScenarioInstance.openScenario.roadNetwork.logics;
	}

	get sceneGraph () {
		return TvScenarioInstance.openScenario.roadNetwork.sceneGraph;
	}

	get currentFile () {
		return TvScenarioInstance.currentFile;
	}

	ngOnInit () {

	}

	selectRoadNetwork () {

		this.changeRoadNetwork();

	}

	changeRoadNetwork () {

		if ( this.currentFile.online ) {

			this.fetchOnlinesFiles();

		} else {

			this.openLocalFile();

		}
	}

	selectSceneGraph () {
	}

	changeSceneGraph () {
	}

	onRoadNetworkSelected ( filename ) {

		this.setRoadNetworkFileName( filename );

	}

	setRoadNetworkFileName ( filename ) {

		this.roadNetwork.logics = new File( filename );

	}

	fetchOnlinesFiles () {

		this.openDriveApi.getAll().subscribe( files => {

			this.files = files;

		} );
	}

	openLocalFile () {

		// this.fileService.import( null, 'road-network', [ 'xml' ], ( file: IFile ) => {

		//     this.file = file;

		//     this.setRoadNetworkFileName( file.path );

		// } );
	}

	importAndBuild ( file: IFile ) {

		this.openDriveService.import( file, () => {

			Debug.log( 'road network imported' );

		} );

		this.dialogRef.close();

	}
}
