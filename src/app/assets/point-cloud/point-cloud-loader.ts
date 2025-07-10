/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Asset } from 'app/assets/asset.model';
import { Color, PointsMaterial } from "three";
import { AssetLoader } from "../../core/interfaces/asset.loader";
import { PointCloudAsset, PointCloudAssetSettings } from './point-cloud-asset';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader';
import { StorageService } from 'app/io/storage.service';
import * as THREE from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class PointCloudLoader implements AssetLoader {

	constructor ( private storageService: StorageService ) { }

	load ( asset: Asset ): PointCloudAsset {

		try {

			const loader = new PCDLoader();

			const buffer = this.storageService.readFileSync( asset.path );

			const arrayBuffer = buffer.buffer.slice( buffer.byteOffset, buffer.byteOffset + buffer.byteLength );

			const points = loader.parse( arrayBuffer );

			( points.material as PointsMaterial ).size = 0.001;

			points.geometry.center();

			points.uuid = asset.guid;

			// // Rotate Z-up to Y-up (PCD → Three.js)
			// const m = new Matrix4().makeRotationX( -Math.PI / 2 );
			// points.geometry.applyMatrix4( m );

			// Optional: Flip if needed
			// points.geometry.scale(1, 1, -1);

			const pointCloudAsset = new PointCloudAsset(
				points.name || 'PointCloud',
				asset.path,
				points
			);

			const settings = pointCloudAsset.settings = this.parseDataSettings( asset.metadata.data );

			points.position.copy( settings.translation );
			points.scale.setScalar( settings.scale );
			points.rotation.set(
				THREE.MathUtils.degToRad( settings.rotation.x ),
				THREE.MathUtils.degToRad( settings.rotation.y ),
				THREE.MathUtils.degToRad( settings.rotation.z )
			);

			( points.material as PointsMaterial ).size = settings.pointSize;
			( points.material as PointsMaterial ).opacity = settings.opacity;
			( points.material as PointsMaterial ).transparent = settings.opacity < 1;
			( points.material as PointsMaterial ).vertexColors = true;

			// apply color to points
			if ( settings.color ) {
				( points.material as PointsMaterial ).color = settings.color;
			}

			// apply points to skip
			if ( settings.pointsToSkip > 0 ) {
				points.geometry.setDrawRange( 0, points.geometry.attributes.position.count - settings.pointsToSkip );
			}

			return pointCloudAsset;

		} catch ( error ) {

			console.error( 'Error loading point cloud:', error );

		}

	}

	// {
	//   "guid": "276b7910-eeb8-455e-9d6a-e740538985b4",
	//   "path": "/Users/himanshu/Documents/Truevision/Props/PointCloud/bun0.pcd",
	//   "isFolder": false,
	//   "importer": "PointCloudImporter",
	//   "data": {
	//     "shift": {
	//       "x": 0,
	//       "y": 0,
	//       "z": 0
	//     },
	//     "scale": 1,
	//     "rotation": {
	//       "x": 0,
	//       "y": 0,
	//       "z": 0
	//     },
	//     "opacity": 1,
	//     "color": 16777215,
	//     "pointSize": 0.01,
	//     "pointsToSkip": 0
	//   }
	// }
	private parseDataSettings ( data: any ): PointCloudAssetSettings {

		const settings = new PointCloudAssetSettings();

		if ( data.translation ) {
			settings.translation.set(
				parseFloat( data.translation.x ) || 0,
				parseFloat( data.translation.y ) || 0,
				parseFloat( data.translation.z ) || 0
			);
		}

		if ( data.rotation ) {
			settings.rotation.set(
				parseFloat( data.rotation.x ) || 0,
				parseFloat( data.rotation.y ) || 0,
				parseFloat( data.rotation.z ) || 0
			);
		}

		settings.scale = parseFloat( data.scale ) || 1.0;
		settings.opacity = parseFloat( data.opacity ) || 1.0;
		settings.color = new Color( parseInt( data.color ?? 0xffffff ) );
		settings.pointSize = parseFloat( data.pointSize ) || 0.01;
		settings.pointsToSkip = parseInt( data.pointsToSkip ) || 0;

		return settings;
	}



}
