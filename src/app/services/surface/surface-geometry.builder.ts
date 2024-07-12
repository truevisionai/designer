/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import earcut from 'earcut';

import { Injectable } from '@angular/core';
import { Vector3, BufferGeometry, BufferAttribute } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceGeometryBuilder {

	constructor () { }

	createSortedPolygon ( positions: Vector3[] ): BufferGeometry {

		function sortByAngle ( points: Vector3[], center: Vector3 ) {
			const angles = points.map( point => Math.atan2( point.y - center.y, point.x - center.x ) );
			return points.map( ( point, index ) => ( { point, index } ) ).sort( ( a, b ) => angles[ a.index ] - angles[ b.index ] ).map( sortedObj => sortedObj.point );
		}

		// Calculate the centroid of the points
		let center = new Vector3();
		positions.forEach( p => { center.add( p ); } );
		center.divideScalar( positions.length );

		// Sort the points by angle from the center
		let sortedPositions = sortByAngle( positions, center );

		return this.createPolygon( sortedPositions );
	}

	createPolygon ( positions: Vector3[] ): BufferGeometry {

		const geometry = new BufferGeometry();

		// Flatten the Vector3 array to a vertices array for earcut
		const vertices = positions.flatMap( p => [ p.x, p.y, p.z ] );

		// Use Earcut to get the indices array for 2D vertices
		const vertices2D = positions.flatMap( p => [ p.x, p.y ] );
		const indices = earcut( vertices2D );

		// Create BufferAttribute for positions and set it in the geometry
		const positionAttribute = new BufferAttribute( new Float32Array( vertices ), 3 );
		geometry.setAttribute( 'position', positionAttribute );
		geometry.setIndex( indices );

		// Compute normals for the vertices
		geometry.computeVertexNormals();

		// Create UV mapping for the mesh
		// Here we models each 1x1 Three.js unit to a 1x1 area in the texture.
		const uvs = new Float32Array( positions.length * 2 );
		for ( let i = 0; i < positions.length; i++ ) {
			// Use the x and y positions directly as UV coordinates
			uvs[ i * 2 ] = positions[ i ].x;
			uvs[ i * 2 + 1 ] = positions[ i ].y;
		}

		geometry.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

		return geometry
	}
}
