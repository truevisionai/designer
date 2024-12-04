/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial } from 'three';
import { MAX_CTRL_POINTS } from '../core/shapes/spline-config';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';


export class Polyline {

	curveType: string;

	mesh: Line;

	constructor ( public points: AbstractControlPoint[] ) {

		const geometry = new BufferGeometry();

		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( MAX_CTRL_POINTS * 3 ), 3 ) );

		this.curveType = 'polyline';

		this.mesh = new Line( geometry, new LineBasicMaterial( { color: COLOR.WHITE, opacity: 0.35, linewidth: 2 } ) );

		this.mesh.name = 'polyline';

		this.mesh.castShadow = true;

		this.mesh.renderOrder = 1;

		this.mesh.frustumCulled = false;
	}

	addPoint ( point: AbstractControlPoint ): void {

		this.points.push( point );

	}

	// Should be called once after curve control points get updated
	update (): void {

		if ( this.points.length <= 1 ) return;

		const position = this.mesh.geometry.attributes.position as BufferAttribute;

		// fill the whole buffer
		for ( let i = 0; i < MAX_CTRL_POINTS; i++ ) {

			const point = i >= this.points.length ? this.points[ this.points.length - 1 ] : this.points[ i ];

			position.setXYZ( i, point.position.x, point.position.y, point.position.z );

		}

		position.needsUpdate = true;
	}
}
