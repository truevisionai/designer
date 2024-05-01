/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils, Mesh } from "three";
import { Material } from "three/src/materials/Material";
import { BufferGeometry } from "three/src/core/BufferGeometry";

export class TvMesh extends Mesh {

	public materialGuid: string | string[];

	public geometryGuid: string;

	constructor (
		public guid: string = MathUtils.generateUUID(),
		public name: string = 'Mesh',
		geometry?: BufferGeometry,
		material?: Material | Material[]
	) {
		super( geometry, material );

		//if ( this.materialGuid === undefined ) {
		//	if ( this.material instanceof Array ) {
		//		this.materialGuid = this.material.map( m => m.uuid );
		//	} else {
		//		this.materialGuid = this.material ? this.material.uuid : null;
		//	}
		//}
		//
		//if ( this.geometryGuid === undefined ) {
		//	this.geometryGuid = geometry ? geometry.uuid : '';
		//}
	}
}
