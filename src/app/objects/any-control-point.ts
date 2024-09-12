/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferAttribute, BufferGeometry, Vector3 } from "three";
import { AbstractControlPoint } from "./abstract-control-point";

/**
 * @deprecated avoid using this use BaseControlPoint or use an exact implementation
 */
export class AnyControlPoint extends AbstractControlPoint {

	static roadTag = 'road';

	static create ( name = '', position?: Vector3 ) {

		const dotGeometry = new BufferGeometry();

		dotGeometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const dotMaterial = this.getDefaultMaterial();

		const cp = new AnyControlPoint( dotGeometry, dotMaterial );

		if ( position ) cp.setPosition( position );

		cp.userData.is_button = true;
		cp.userData.is_control_point = true;
		cp.userData.is_selectable = true;

		cp.tag = this.roadTag;

		cp.renderOrder = 3;

		return cp;
	}

}
