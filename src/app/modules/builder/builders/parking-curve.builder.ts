/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Group, Object3D } from "three";
import { MeshBuilder } from "../../../core/builders/mesh.builder";
import { AssetService } from "app/assets/asset.service";
import { ParkingCurve } from "app/map/parking/parking-curve";
import { ParkingRegion } from "app/map/parking/parking-region";
import * as THREE from "three";

@Injectable()
export class ParkingCurveBuilder extends MeshBuilder<ParkingCurve> {

	constructor (
		private assetService: AssetService,
	) {
		super();
	}

	build ( curve: ParkingCurve ): Object3D {

		const group = new Group();

		if ( curve.getControlPoints().length < 2 ) return;

		const regions = curve.generatePreviewRegions();

		regions.forEach( region => {

			const regionMesh = this.buildRegionMesh( region );

			if ( regionMesh ) group.add( regionMesh );

		} )

		return group;
	}

	buildRegionMesh ( region: ParkingRegion ): Object3D {

		// region.getEdges().forEach( edge => {})

		const group = new Group();

		region.getNodes().forEach( node => {

			// create green cube as placeholder
			const geometry = new THREE.BoxGeometry( 1, 1, 1 );
			const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			const cube = new THREE.Mesh( geometry, material );

			cube.position.copy( node.position );

			group.add( cube );

		} )

		return group;
	}



}
