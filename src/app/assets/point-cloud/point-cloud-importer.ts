/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Importer } from "app/core/interfaces/importer";
import { TvConsole } from "app/core/utils/console";
import { FileExtension } from "app/io/file-extension";
import { FileUtils } from "app/io/file-utils";
import { StorageService } from "app/io/storage.service";
import { SnackBar } from "app/services/snack-bar.service";
import { MathUtils } from "three";
import { AssetService } from "../asset.service";
import { PointCloudAsset } from "./point-cloud-asset";
import { PointCloudObject } from "./point-cloud-object";

// JSM
import { loadPointCloud } from "./point-cloud-loader";


@Injectable( {
	providedIn: 'root'
} )
export class PointCloudImporter implements Importer {

	constructor (
		private assetService: AssetService,
		private storageService: StorageService,
		private snackBar: SnackBar
	) {
	}

	async import ( sourcePath: string, destinationFolder: string ): Promise<void> {

		const extension = FileUtils.getExtensionFromPath( sourcePath ).toLowerCase();

		switch ( extension ) {

			case FileExtension.PCD:
				await this.importPointCloud( sourcePath, destinationFolder );
				break;

			default:
				TvConsole.error( `${ extension } point cloud not supported` );
				break;

		}

	}

	private async importPointCloud ( sourcePath: string, destinationFolder: string ): Promise<void> {

		try {

			const guid = MathUtils.generateUUID();

			const pointCloudObject = loadPointCloud( this.storageService, sourcePath, guid );

			this.createPointCloudAsset( pointCloudObject, sourcePath, destinationFolder );

		} catch ( error ) {

			this.snackBar?.error( error );

		}

	}

	private createPointCloudAsset ( pointCloudObject: PointCloudObject, sourcePath: string, destinationFolder: string ): void {

		const sourceFilename = FileUtils.getFilenameFromPath( sourcePath );

		const destinationPath = this.storageService.join( destinationFolder, sourceFilename );

		this.storageService.copyFileSync( sourcePath, destinationPath );

		const asset = new PointCloudAsset( sourceFilename, destinationPath, pointCloudObject.uuid );

		asset.setObject3D( pointCloudObject );

		const json = JSON.stringify( asset.metadata, null, 2 );

		this.storageService.writeSync( `${ destinationPath }.meta`, json );

		this.assetService.addAsset( asset );

		this.assetService.assetCreated.emit( asset );

	}

}
