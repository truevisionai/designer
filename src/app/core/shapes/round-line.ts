/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';
import { ARC_TESSEL, MAX_CTRL_POINTS } from './spline-config';

export class RoundLine {

	public radiuses: number[];

	curveType;

	mesh: Line;

	constructor ( public points: BaseControlPoint[] ) {

		const geometry = new BufferGeometry();

		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( MAX_CTRL_POINTS * ARC_TESSEL * 3 ), 3 ) );

		this.curveType = 'roundline';

		this.mesh = new Line( geometry, new LineBasicMaterial( { color: COLOR.CYAN, opacity: 0.35, linewidth: 2 } ) );

		this.mesh.name = 'roundline';

		this.mesh.castShadow = true;

		this.mesh.renderOrder = 3;

		this.mesh.frustumCulled = false;

	}

	addPoint ( point: BaseControlPoint ) {

		this.points.push( point );

	}

	calcRadius (): void {

		if ( this.points.length === 0 ) return;

		// init all radiuses to Infinity
		this.radiuses = new Array( this.points.length );

		// store lengths from one point to another for the whole spline
		const lengths = new Array( this.points.length - 1 );

		let currentPoint: BaseControlPoint = null;

		let nextPoint: BaseControlPoint = null;

		this.points.forEach( ( currentPoint, i ) => {

			// set the radius at each point 0 by default
			this.radiuses[ i ] = 0;

			// set the lengths until the last point
			if ( i < this.points.length - 1 ) {

				nextPoint = this.points[ i + 1 ];

				lengths[ i ] = currentPoint.position.distanceTo( nextPoint.position );

			}

		} );

		// // foreach point
		// for ( let i = 0; i < this.points.length; i++ ) {
		//     // set the radius at each point 0 by default
		//     this.radiuses[ i ] = 0;
		//     // set the lengths until the last point
		//     if ( i < this.points.length - 1 ) {
		//         currentPoint = this.points[ i ];
		//         nextPoint = this.points[ i + 1 ];
		//         lengths[ i ] = currentPoint.distanceTo( nextPoint );
		//     }
		// }

		// foreach point except the first one
		for ( let i = 1; i < this.points.length - 1; i++ ) {

			this.radiuses[ i ] = Math.min( lengths[ i - 1 ], lengths[ i ] );

		}

		for ( let updated = true; updated; ) {

			updated = false;

			for ( let i = 1; i < this.points.length - 1; i++ ) {

				const leftR = this.radiuses[ i - 1 ] + this.radiuses[ i ] > lengths[ i - 1 ] ? lengths[ i - 1 ] / 2 : this.radiuses[ i ];

				const rightR = this.radiuses[ i + 1 ] + this.radiuses[ i ] > lengths[ i ] ? lengths[ i ] / 2 : this.radiuses[ i ];

				const minR = Math.min( leftR, rightR );

				if ( minR != this.radiuses[ i ] ) {

					updated = true;

					this.radiuses[ i ] = minR;

				}
			}
		}
	}

	update (): void {

		if ( this.points.length <= 1 ) return;

		this.calcRadius();

		const position = this.mesh.geometry.attributes.position as BufferAttribute;

		const pos = new Vector3();

		const ARC_TESSEL_HALF = ARC_TESSEL / 2;

		let vertexIndex = 0;

		let currentPoint: Vector3 = null;

		let prevPoint: Vector3 = null;

		let nextPoint: Vector3 = null;

		let radius = null;

		// foreach point

		for ( let i = 0; i < this.points.length; i++ ) {

			currentPoint = this.points[ i ].position;

			radius = this.radiuses[ i ];

			if ( radius == 0 ) {

				pos.copy( currentPoint );

				position.setXYZ( vertexIndex++, pos.x, pos.y, pos.z );

			} else {

				prevPoint = this.points[ i - 1 ].position;

				nextPoint = this.points[ i + 1 ].position;

				const p1 = new Vector3()
					.subVectors( prevPoint, currentPoint )
					.normalize()
					.multiplyScalar( radius )
					.add( currentPoint );

				const p0 = currentPoint;

				const p2 = new Vector3()
					.subVectors( nextPoint, currentPoint )
					.normalize()
					.multiplyScalar( radius )
					.add( currentPoint );

				for ( let ii = 0; ii < ARC_TESSEL_HALF; ii++ ) {

					pos.lerpVectors( p1, p0, ii / ARC_TESSEL_HALF );

					pos.copy( this.arcInterpolation( currentPoint, prevPoint, nextPoint, radius, pos ) );

					position.setXYZ( vertexIndex++, pos.x, pos.y, pos.z );

				}

				for ( let ii = 0; ii < ARC_TESSEL_HALF; ii++ ) {

					pos.lerpVectors( p0, p2, ii / ARC_TESSEL_HALF );

					pos.copy( this.arcInterpolation( currentPoint, prevPoint, nextPoint, radius, pos ) );

					position.setXYZ( vertexIndex++, pos.x, pos.y, pos.z );

				}
			}
		}

		// repeat last point
		for ( let i = vertexIndex; i < MAX_CTRL_POINTS * ARC_TESSEL; i++ ) {

			position.setXYZ( i, pos.x, pos.y, pos.z );

		}

		position.needsUpdate = true;
	}

	arcInterpolation ( currentPoint: Vector3, prevPoint: Vector3, nextPoint: Vector3, radius: number, v: Vector3 ) {

		const va = new Vector3()
			.subVectors( prevPoint, currentPoint )
			.normalize()
			.multiplyScalar( radius );

		const vb = new Vector3()
			.subVectors( nextPoint, currentPoint )
			.normalize()
			.multiplyScalar( radius );

		// const t = ( va.x * va.x + va.y * va.y + va.z * va.z ) / ( va.x * va.x + va.y * va.y + va.z * va.z + vb.x * va.x + vb.y * va.y + vb.z * va.z );
		const t = ( va.x * va.x + va.z * va.z + va.y * va.y )
			/ ( va.x * va.x + va.z * va.z + va.y * va.y + vb.x * va.x + vb.z * va.z + vb.y * va.y );

		// center of circle
		const p = new Vector3().addVectors( va, vb ).multiplyScalar( t ).add( currentPoint );

		// radius of circle
		const r = new Vector3().addVectors( currentPoint, va ).distanceTo( p );

		// project to circle
		return new Vector3().subVectors( v, p ).normalize().multiplyScalar( r ).add( p );
	}
}
