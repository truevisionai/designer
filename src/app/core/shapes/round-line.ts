/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';
import { ARC_TESSEL, MAX_CTRL_POINTS } from './spline-config';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { InvalidValueException } from 'app/exceptions/exceptions';
import { Maths } from 'app/utils/maths';
import { Log } from '../utils/log';

export class RoundLine {

	public radiuses: number[];

	curveType;

	mesh: Line;

	constructor ( public points: AbstractControlPoint[] ) {

		const geometry = new BufferGeometry();

		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( MAX_CTRL_POINTS * ARC_TESSEL * 3 ), 3 ) );

		this.curveType = 'roundline';

		this.mesh = new Line( geometry, new LineBasicMaterial( { color: COLOR.CYAN, opacity: 0.35, linewidth: 2 } ) );

		this.mesh.name = 'roundline';

		this.mesh.castShadow = true;

		this.mesh.renderOrder = 3;

		this.mesh.frustumCulled = false;

	}

	addPoint ( point: AbstractControlPoint ) {

		this.points.push( point );

	}

	private calcRadiusNew (): void {

		// Exit if there are no points
		if ( this.points.length === 0 ) return;

		// Initialize all radii to 0
		this.radiuses = new Array( this.points.length ).fill( 0 );

		// If there are exactly 2 points, they form a straight line, so keep radii as 0
		if ( this.points.length === 2 ) return;

		// Iterate through each point, skipping the first and last
		for ( let i = 1; i < this.points.length - 1; i++ ) {

			const p0 = this.points[ i - 1 ].position;
			const p1 = this.points[ i ].position;
			const p2 = this.points[ i + 1 ].position;

			if ( !this.isStraightLine( p0, p1, p2 ) ) {
				// Advanced curvature analysis
				const curvature = this.calculateCurvature( p0, p1, p2 );
				// Adjust radius based on curvature and distances
				this.radiuses[ i ] = this.adjustRadiusBasedOnCurvature( curvature, p0, p1, p2 );
			}
			// Additional logic for smoothing transitions between radii
			this.radiuses[ i ] = this.smoothTransition( i, this.radiuses );
		}

	}

	private calculateCurvature ( p0: Vector3, p1: Vector3, p2: Vector3 ): number {
		const a = p0.distanceTo( p1 );
		const b = p1.distanceTo( p2 );
		const c = p2.distanceTo( p0 );

		const s = ( a + b + c ) / 2; // semi-perimeter
		const area = Math.sqrt( s * ( s - a ) * ( s - b ) * ( s - c ) ); // Heron's formula for area

		const radius = ( a * b * c ) / ( 4 * area ); // radius of circumscribed circle
		const curvature = 1 / radius; // curvature is the inverse of radius

		return curvature;
	}

	private adjustRadiusBasedOnCurvature ( curvature: number, p0: Vector3, p1: Vector3, p2: Vector3 ): number {
		const baseRadius = Math.min( p0.distanceTo( p1 ), p1.distanceTo( p2 ) ); // minimum of the distances to adjacent points

		// Adjusting radius based on curvature: smaller radius for higher curvature
		// You can introduce a factor to scale the effect of curvature on radius
		const curvatureFactor = 1.0; // Adjust this factor based on your requirements
		const adjustedRadius = baseRadius / ( 1 + curvature * curvatureFactor );

		return Math.max( adjustedRadius, 0 ); // ensure non-negative radius
	}

	private smoothTransition ( index: number, radiuses: number[] ): number {
		if ( index <= 0 || index >= radiuses.length - 1 ) {
			return radiuses[ index ]; // No smoothing for first and last points
		}

		// Simple average of the current radius and its neighbors
		const smoothedRadius = ( radiuses[ index - 1 ] + radiuses[ index ] + radiuses[ index + 1 ] ) / 3;

		return smoothedRadius;
	}


	private calcRadiusOld (): void {

		if ( this.points.length === 0 ) return;

		// init all radiuses to Infinity
		this.radiuses = new Array( this.points.length );

		// store lengths from one point to another for the whole spline
		const distances = new Array( this.points.length - 1 );

		let currentPoint: AbstractControlPoint = null;

		let nextPoint: AbstractControlPoint = null;

		this.points.forEach( ( currentPoint, i ) => {

			// set the radius at each point 0 by default
			this.radiuses[ i ] = 0;

			// set the lengths until the last point
			if ( i < this.points.length - 1 ) {

				nextPoint = this.points[ i + 1 ];

				const distance = currentPoint.position.distanceTo( nextPoint.position );

				if ( isNaN( distance ) ) {
					Log.error( 'distance is NaN' );
					throw new InvalidValueException( 'distance is NaN' );
				}

				if ( Maths.approxEquals( distance, 0 ) ) {
					Log.error( 'distance is 0' );
					// throw new InvalidValueException( 'distance is 0' );
				}

				if ( distance < 0 ) {
					Log.error( 'distance is negative' );
					throw new InvalidValueException( 'distance is negative' );
				}

				if ( distance === Infinity ) {
					Log.error( 'distance is Infinity' );
					throw new InvalidValueException( 'distance is Infinity' );
				}

				distances[ i ] = distance;

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

			this.radiuses[ i ] = Math.min( distances[ i - 1 ], distances[ i ] );

		}

		for ( let updated = true; updated; ) {

			updated = false;

			for ( let i = 1; i < this.points.length - 1; i++ ) {

				const leftR = this.radiuses[ i - 1 ] + this.radiuses[ i ] > distances[ i - 1 ] ? distances[ i - 1 ] / 2 : this.radiuses[ i ];

				const rightR = this.radiuses[ i + 1 ] + this.radiuses[ i ] > distances[ i ] ? distances[ i ] / 2 : this.radiuses[ i ];

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

		this.calcRadiusOld();
		// this.calcRadiusNew();

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

	private arcInterpolation ( currentPoint: Vector3, prevPoint: Vector3, nextPoint: Vector3, radius: number, v: Vector3 ) {

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

	private isStraightLine ( p0: Vector3, p1: Vector3, p2: Vector3 ): boolean {

		const v1 = new Vector3().subVectors( p1, p0 ).normalize();

		const v2 = new Vector3().subVectors( p2, p1 ).normalize();

		const angle = v1.angleTo( v2 );

		return Math.abs( angle ) < 0.01 || Math.abs( Math.PI - angle ) < 0.01; // Threshold for straight line

	}

}
