/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';
import { ARC_SEGMENTS, PARACUBICFACTOR } from './spline-config';
import { COLOR } from 'app/shared/utils/colors.service';

class ParametricPolynomial {
	private curveType;
	private mesh;

	constructor ( private points ) {
		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );
		this.curveType = 'cubic';
		this.mesh = new Line( geometry, new LineBasicMaterial( { color: COLOR.CYAN, opacity: 0.85 } ) );
		this.mesh.castShadow = true;
		this.mesh.renderOrder = 1;
		this.mesh.frustumCulled = false;
	}

	update () {
		const position = this.mesh.geometry.attributes.position;
		const point = new Vector3();
		for ( let i = 0; i < ARC_SEGMENTS; i++ ) {
			const t = i / ( ARC_SEGMENTS - 1 );
			this.getPoint( t, point );
			position.setXYZ( i, point.x, point.y, point.z );
		}
		position.needsUpdate = true;
	}

	getPoint ( t, rettarget ) {
		const retpoint = rettarget || new Vector3();
		const p1 = this.points[ 0 ];
		const p2 = this.points[ 3 ];
		const t1 = new Vector3().subVectors( this.points[ 1 ], p1 ).multiplyScalar( PARACUBICFACTOR );
		const t2 = new Vector3().subVectors( p2, this.points[ 2 ] ).multiplyScalar( PARACUBICFACTOR );
		// tslint:disable-next-line: one-variable-per-declaration
		const s = t, s2 = s * s, s3 = s2 * s;
		const h1 = new Vector3().setScalar( 2 * s3 - 3 * s2 + 1 ).multiply( p1 );
		const h2 = new Vector3().setScalar( -2 * s3 + 3 * s2 ).multiply( p2 );
		const h3 = new Vector3().setScalar( s3 - 2 * s2 + s ).multiply( t1 );
		const h4 = new Vector3().setScalar( s3 - s2 ).multiply( t2 );
		retpoint.copy( h1 ).add( h2 ).add( h3 ).add( h4 );
		return retpoint;
	}
}
