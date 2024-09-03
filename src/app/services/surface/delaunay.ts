/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferAttribute, BufferGeometry, Vector2, Vector3 } from "three";
import Delaunator from 'delaunator';

export class DelaunatorHelper {

	// eslint-disable-next-line max-lines-per-function
	static createGeometry ( points: Vector2[], originalPoints: Vector3[] ): BufferGeometry {

		// Convert points to a flat array for Delaunator
		const vertices = points.reduce( ( acc, point ) => acc.concat( [ point.x, point.y ] ), [] );

		// Perform Delaunay triangulation
		const delaunay = new Delaunator( vertices );
		const triangles = delaunay.triangles;

		// Create geometry
		const geometry = new BufferGeometry();
		const verticesArray = new Float32Array( points.length * 3 );
		for ( let i = 0; i < points.length; i++ ) {
			verticesArray[ i * 3 ] = points[ i ].x;
			verticesArray[ i * 3 + 1 ] = points[ i ].y;
			verticesArray[ i * 3 + 2 ] = originalPoints[ i ].z;
		}

		const uvArray = this.calculateUVs( points );
		const filteredTriangles = this.filterTriangles( vertices, triangles, points );
		const filteredTrianglesArray = new Uint32Array( filteredTriangles );

		geometry.setAttribute( 'position', new BufferAttribute( verticesArray, 3 ) );
		geometry.setIndex( new BufferAttribute( filteredTrianglesArray, 1 ) );
		geometry.setAttribute( 'uv', new BufferAttribute( uvArray, 2 ) );
		geometry.computeBoundingBox();
		geometry.computeVertexNormals();

		return geometry;
	}

	static createFromPoints ( points: Vector3[] ): BufferGeometry {

		return this.createGeometry( points.map( point => new Vector2( point.x, point.y ) ), points );

	}

	// eslint-disable-next-line max-lines-per-function
	private static filterTriangles ( vertices: number[], triangles: number[], boundaryPositions: Vector2[] ): number[] {

		// Check if a point is inside the boundary using a point-in-polygon test
		function isPointInsideBoundary ( x, y ): boolean {
			let inside = false;
			for ( let i = 0, j = boundaryPositions.length - 1; i < boundaryPositions.length; j = i++ ) {
				const xi = boundaryPositions[ i ].x, yi = boundaryPositions[ i ].y;
				const xj = boundaryPositions[ j ].x, yj = boundaryPositions[ j ].y;

				const intersect = ( yi > y ) != ( yj > y ) && ( x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi );
				if ( intersect ) inside = !inside;
			}
			return inside;
		}

		// Filter triangles to keep only those inside the boundary
		const filteredTriangles = [];
		for ( let i = 0; i < triangles.length; i += 3 ) {
			const ax = vertices[ triangles[ i ] * 2 ];
			const ay = vertices[ triangles[ i ] * 2 + 1 ];
			const bx = vertices[ triangles[ i + 1 ] * 2 ];
			const by = vertices[ triangles[ i + 1 ] * 2 + 1 ];
			const cx = vertices[ triangles[ i + 2 ] * 2 ];
			const cy = vertices[ triangles[ i + 2 ] * 2 + 1 ];

			// Use the centroid of the triangle for the inside check
			const centroidX = ( ax + bx + cx ) / 3;
			const centroidY = ( ay + by + cy ) / 3;

			if ( isPointInsideBoundary( centroidX, centroidY ) ) {
				// Swap order to maintain counter-clockwise winding
				filteredTriangles.push( triangles[ i ], triangles[ i + 2 ], triangles[ i + 1 ] );
			}
		}

		return filteredTriangles;
	}

	private static calculateUVs ( points ): Float32Array {

		const uvArray = new Float32Array( points.length * 2 );
		let minX = Infinity, maxX = -Infinity;
		let minY = Infinity, maxY = -Infinity;

		// First pass: find bounds
		for ( let i = 0; i < points.length; i++ ) {
			minX = Math.min( minX, points[ i ].x );
			maxX = Math.max( maxX, points[ i ].x );
			minY = Math.min( minY, points[ i ].y );
			maxY = Math.max( maxY, points[ i ].y );
		}

		const aspectRatio = 1;

		// based on bounds min/max
		const textureScale = Math.max( maxX - minX, maxY - minY );

		// Determine scale based on bounds and desired texture repetition
		const xScale = ( maxX - minX ) / textureScale;
		const yScale = ( maxY - minY ) / ( textureScale * aspectRatio );

		// Second pass: assign UVs based on scaled position within bounds
		for ( let i = 0; i < points.length; i++ ) {
			uvArray[ i * 2 ] = ( points[ i ].x - minX ) / xScale;
			uvArray[ i * 2 + 1 ] = ( points[ i ].y - minY ) / yScale;
		}

		return uvArray;
	}

}
