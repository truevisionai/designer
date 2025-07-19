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
import { Points, PointsMaterial } from "three";
import { AssetService } from "../asset.service";
import { PointCloudAsset } from "./point-cloud-asset";
import { PointCloudObject } from "./point-cloud-object";

// JSM
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader";


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


			const loader = new PCDLoader();

			const buffer = this.storageService.readFileSync( sourcePath );

			const arrayBuffer = buffer.buffer.slice( buffer.byteOffset, buffer.byteOffset + buffer.byteLength );

			const points = loader.parse( arrayBuffer );

			( points.material as PointsMaterial ).size = 0.001;

			points.geometry.center();

			// // Rotate Z-up to Y-up (PCD → Three.js)
			// const m = new Matrix4().makeRotationX( -Math.PI / 2 );
			// points.geometry.applyMatrix4( m );

			// Optional: Flip if needed
			// points.geometry.scale(1, 1, -1);

			this.createPointCloudAsset( points, sourcePath, destinationFolder );

		} catch ( error ) {

			this.snackBar?.error( error );

		}

	}

	private createPointCloudAsset ( points: Points, sourcePath: string, destinationFolder: string ): void {

		const sourceFilename = FileUtils.getFilenameFromPath( sourcePath );

		const destinationPath = this.storageService.join( destinationFolder, sourceFilename );

		this.storageService.copyFileSync( sourcePath, destinationPath );

		const object3D = PointCloudObject.fromPoints( points, points.uuid );

		const name = points.name || 'PointCloud';

		const asset = new PointCloudAsset( name, destinationPath, object3D.uuid );

		asset.setObject3D( object3D );

		asset.metadata.guid = object3D.uuid;
		asset.metadata.path = destinationPath;

		const json = JSON.stringify( asset.metadata, null, 2 );

		this.storageService.writeSync( `${ destinationPath }.meta`, json );

		this.assetService.addAsset( asset );

		this.assetService.assetCreated.emit( asset );

	}

}
