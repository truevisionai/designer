/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Object3D } from 'three';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { AssetImporterService } from '../../../core/asset-importer.service';
import { FileUtils } from '../../../services/file-utils';
import { FileService } from '../../../services/file.service';
import { SnackBar } from '../../../services/snack-bar.service';
import { MetadataFactory } from 'app/core/factories/metadata-factory.service';

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

	object: Object3D;

	scale = 1;

	constructor (
		private dialogRef: MatDialogRef<ImportFbxDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: ImportFbxDialogData,
		private fileService: FileService,
	) {
	}

	async ngOnInit () {

		const loader = new FBXLoader();

		const buffer = await this.fileService.readAsArrayBuffer( this.data.path );

		const directory = FileUtils.getDirectoryFromPath( this.data.path );

		this.object = loader.parse( buffer, directory );

	}

	onScaleChanged ( $scale ) {

		// this.object?.scale.setScalar( $scale );

	}

	import () {

		this.fileService.fs.copyFileSync( this.data.path, this.data.destinationPath );

		const filename = FileUtils.getFilenameFromPath( this.data.path );

		const extension = this.data.extension || FileUtils.getExtensionFromPath( this.data.path );

		MetadataFactory.createMetadata( filename, extension, this.data.destinationPath );

		this.dialogRef.close();

	}
}
