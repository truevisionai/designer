/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Object3D } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { FileUtils } from '../../../io/file-utils';
import { FileService } from '../../../io/file.service';
import { Asset, AssetType } from 'app/assets/asset.model';
import { TvConsole } from 'app/core/utils/console';

export class ImportFbxDialogData {
	constructor ( public path: string, public destinationPath: string, public extension: string ) {
	}
}

@Component( {
	selector: 'app-import-fbx-dialog',
	templateUrl: './import-fbx-dialog.component.html',
	styleUrls: [ './import-fbx-dialog.component.scss' ]
} )
export class ImportFbxDialogComponent implements OnInit {

	error: string;

	object: Object3D;

	assetNode: Asset;

	scale = 1;

	destinationFolder: string;

	constructor (
		private dialogRef: MatDialogRef<ImportFbxDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: ImportFbxDialogData,
		private fileService: FileService,
	) {
	}

	async ngOnInit () {

		const loader = new FBXLoader();

		try {

			const buffer = await this.fileService.readAsArrayBuffer( this.data.path );

			const directory = FileUtils.getDirectoryFromPath( this.data.path );

			this.object = loader.parse( buffer, directory );

			this.assetNode = new Asset( AssetType.MODEL, '', '' );

		} catch ( e: any ) {

			this.error = 'Error in loading fbx file ' + e.message.replace( 'THREE', '' );

			TvConsole.error( 'Error in loading fbx file ' );


		}

	}

	import () {

	}

}
