import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from 'app/modules/tv-map/models/geometries/tv-arc-geometry';
import { TvLineGeometry } from 'app/modules/tv-map/models/geometries/tv-line-geometry';
import { Vector2, Vector3 } from 'three';
import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";


export class RoundLineFactory {

	static computeRadii ( positions: Vector3[] ): number[] {

		if ( positions.length === 0 ) return;

		// init all radii to Infinity
		const radii = new Array( positions.length );

		// store lengths from one point to another for the whole spline
		const lengths = new Array( positions.length - 1 );

		positions.forEach( ( position, i ) => {

			// set the radius at each point 0 by default
			radii[ i ] = 0;

			// set the lengths until the last point
			if ( i < positions.length - 1 ) {

				const nextPosition = positions[ i + 1 ];

				lengths[ i ] = position.distanceTo( nextPosition );

			}

		} );

		for ( let i = 1; i < positions.length - 1; i++ ) {

			radii[ i ] = Math.min( lengths[ i - 1 ], lengths[ i ] );

		}

		for ( let updated = true; updated; ) {

			updated = false;

			for ( let i = 1; i < positions.length - 1; i++ ) {

				const leftR = radii[ i - 1 ] + radii[ i ] > lengths[ i - 1 ] ? lengths[ i - 1 ] / 2 : radii[ i ];

				const rightR = radii[ i + 1 ] + radii[ i ] > lengths[ i ] ? lengths[ i ] / 2 : radii[ i ];

				const minR = Math.min( leftR, rightR );

				if ( minR != radii[ i ] ) {

					updated = true;

					radii[ i ] = minR;

				}
			}
		}

		return radii;
	}

	static computeGeometries ( positions: Vector3[], hdgs: number[], radii: number[] ) {

		let totalLength = 0;

		const geometries: TvAbstractRoadGeometry[] = [];

		let s = totalLength;

		for ( let i = 1; i < positions.length; i++ ) {

			let x, y, hdg, length;

			const previous = positions[ i - 1 ];
			const current = positions[ i ];

			const p1 = new Vector2( previous.x, previous.y );
			const p2 = new Vector2( current.x, current.y );

			const d = p1.distanceTo( p2 );

			// line between p1 and p2
			if ( d - radii[ i - 1 ] - radii[ i ] > 0.001 ) {

				[ x, y ] = new Vector2()
					.subVectors( p2, p1 )
					.normalize()
					.multiplyScalar( radii[ i - 1 ] )
					.add( p1 )
					.toArray();

				hdg = hdgs[ i - 1 ];

				length = d - radii[ i - 1 ] - radii[ i ];

				s = totalLength;

				totalLength += length;

				geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );

			}

			// arc for p2
			if ( radii[ i ] > 0 ) { // first and last point can't have zero radii

				const next = positions[ i + 1 ];

				const dir1 = new Vector2( current.x - previous.x, current.y - previous.y ).normalize();

				const dir2 = new Vector2( next.x - current.x, next.y - current.y ).normalize();

				const pp1 = new Vector2()
					.subVectors( p1, p2 )
					.normalize()
					.multiplyScalar( radii[ i ] )
					.add( p2 );

				const pp2 = new Vector2()
					.subVectors( ( new Vector2( next.x, next.y ) ), p2 )
					.normalize()
					.multiplyScalar( radii[ i ] )
					.add( p2 );

				x = pp1.x;

				y = pp1.y;

				hdg = dir1.angle();

				let r, alpha, sign;

				[ r, alpha, length, sign ] = this.getArcParams( pp1, pp2, dir1, dir2 );

				if ( r != Infinity ) {

					s = totalLength;

					totalLength += length;

					const curvature = ( sign > 0 ? 1 : -1 ) * ( 1 / r ); // sign < for mirror image

					geometries.push( new TvArcGeometry( s, x, y, hdg, length, curvature ) );


				} else {

					s = totalLength;

					length = pp1.distanceTo( pp2 );

					totalLength += length;

					geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );

					console.warn( 'radius is infinity' );

				}


			}

		}

		return geometries;

	}


	private static getArcParams ( p1: Vector2, p2: Vector2, dir1: Vector2, dir2: Vector2 ): number[] {

		const distance = p1.distanceTo( p2 );

		const normalisedDotProduct = new Vector2()
			.copy( dir1 )
			.normalize()
			.dot( new Vector2().copy( dir2 ).normalize() );

		const alpha = Math.acos( normalisedDotProduct );

		const r = distance / 2 / Math.sin( alpha / 2 );

		const length = r * alpha;

		const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;

		const det = 1 / ( ma * md - mb * mc );

		const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

		const p2proj = new Vector2().subVectors( p2, p1 );

		p2proj.set( p2proj.x * mia + p2proj.y * mic, p2proj.x * mib + p2proj.y * mid );

		return [ r, alpha, length, Math.sign( p2proj.y ) ];
	}
}
