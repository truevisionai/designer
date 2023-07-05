import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Object3D } from 'three';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { AssetImporterService } from '../../../core/asset-importer.service';
import { FileUtils } from '../../../services/file-utils';
import { FileService } from '../../../services/file.service';
import { SnackBar } from '../../../services/snack-bar.service';

@Component( {
	selector: 'app-import-fbx-dialog',
	templateUrl: './import-fbx-dialog.component.html',
	styleUrls: [ './import-fbx-dialog.component.scss' ]
} )
export class ImportFbxDialogComponent implements OnInit {

	object: Object3D;

	scale = 1;

	constructor (
		private dialogRef: MatDialogRef<ImportFbxDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: any,
		private assetImporterService: AssetImporterService,
		private fileService: FileService,
	) {
	}

	async ngOnInit () {

		const loader = new FBXLoader();

		try {

			const contents = await this.fileService.readAsync( this.data.path );
			const directory = FileUtils.getDirectoryFromPath( this.data.path );
			this.object = loader.parse( contents, directory );


		} catch ( error ) {

			const buffer = await this.fileService.readAsArrayBuffer( this.data.path );

			const directory = FileUtils.getDirectoryFromPath( this.data.path );

			this.object = loader.parse( buffer, directory );

			console.error( error );

		}


	}

	onScaleChanged ( $scale ) {

		this.object?.scale.setScalar( $scale );
	}

	import () {

	}
}
