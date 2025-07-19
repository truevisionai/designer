/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Asset } from 'app/assets/asset.model';
import { AssetLoader } from "../../core/interfaces/asset.loader";
import { PointCloudAsset } from './point-cloud-asset';
import { PointCloudObject } from "./point-cloud-object";
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';
import { StorageService } from 'app/io/storage.service';
import { BufferAttribute, BufferGeometry, PointsMaterial } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class PointCloudLoader implements AssetLoader {

	constructor ( private storageService: StorageService ) { }

	load ( asset: Asset ): PointCloudAsset {

		const pointCloudObject = this.loadPointCloud( asset );

		const name = asset.name || 'PointCloud';
		const path = asset.path || '';

		const pointCloudAsset = new PointCloudAsset( name, path );

		// NOTE: important
		pointCloudAsset.metadata.guid = asset.guid;
		pointCloudAsset.metadata.path = asset.path;

		pointCloudAsset.setObject3D( pointCloudObject );

		return pointCloudAsset;

	}

	private loadPointCloud ( asset: Asset ): PointCloudObject {

		try {

			const loader = new PCDLoader();

			const buffer = this.storageService.readFileSync( asset.path );

			const arrayBuffer = buffer.buffer.slice( buffer.byteOffset, buffer.byteOffset + buffer.byteLength );

			const points = loader.parse( arrayBuffer );

			// // Rotate Z-up to Y-up (PCD → Three.js)
			// const m = new Matrix4().makeRotationX( -Math.PI / 2 );
			// points.geometry.applyMatrix4( m );

			// Optional: Flip if needed
			// points.geometry.scale(1, 1, -1);

			points.geometry.center();

			return PointCloudObject.fromPoints( points, asset.guid );

		} catch ( error ) {

			console.error( 'Error loading point cloud:', error );

			const geometry = new BufferGeometry();
			const material = new PointsMaterial( { size: 0.05, color: 0xffffff } );

			geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 0 ), 3 ) );
			geometry.setAttribute( 'color', new BufferAttribute( new Float32Array( 0 ), 3 ) );

			// Create a default material if the PCDLoader fails

			const pointCloudObject = new PointCloudObject( asset.guid, geometry, material );

			pointCloudObject.name = asset.name || 'PointCloud';

			return pointCloudObject;

		}

	}

}
