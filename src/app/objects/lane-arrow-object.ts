/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferGeometry, Float32BufferAttribute, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, Vector3 } from "three";
import { OdBuilderConfig } from '../modules/builder/builders/od-builder-config';
import { OdTextures } from 'app/deprecated/od.textures';

export class SimpleArrowObject extends Mesh {

	constructor ( position: Vector3, hdg: number, size = 0.5 ) {

		position.z = position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT;

		// Define a unit arrow, pointing towards +Y direction.
		const arrowVertices = [
			-size, 0, 0,  // bottom of the arrow
			size, 0, 0,  // right corner of the arrow head
			0, size * 2, 0,  // tip of the arrow head
		];

		// Colors for each vertex.
		const arrowColors = [
			0, 1, 0,  // Red
			0, 1, 0,  // Green
			0, 1, 0,  // Blue
		];

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( arrowVertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( arrowColors, 3 ) );

		const material = new MeshBasicMaterial( { vertexColors: true } );

		super( geometry, material );

		this.name = 'SimpleArrowObject';

		// Compute the direction vector from the heading
		const direction = new Vector3( Math.cos( hdg ), Math.sin( hdg ), 0 );

		// Compute the quaternion that represents the rotation from +Y to the direction.
		const quaternion = new Quaternion().setFromUnitVectors( new Vector3( 0, 1, 0 ), direction.normalize() );

		// Create the transformation matrix.
		const matrix = new Matrix4();
		matrix.compose( position, quaternion, new Vector3( 1, 1, 1 ) );  // Using uniform scaling.

		// Apply the transformation to the arrow.
		this.applyMatrix4( matrix );


	}


}

export class SharpArrowObject extends Mesh {

	constructor ( position: Vector3, hdg: number, color = 0xffffff, size = 0.5 ) {

		position.z = position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT;

		const geometry = new PlaneGeometry( size, size );

		const texture = OdTextures.arrowSharp();

		const material = new MeshBasicMaterial( {
			color: color,
			map: texture,
			transparent: true,
			alphaTest: 0.9,
			depthTest: false,
			depthWrite: false,
		} );

		super( geometry, material );

		this.name = 'SharpArrowObject';

		/// Set the object's rotation.
		// The arrow is assumed to be oriented upward by default.
		// To have it point in the direction defined by hdg (in radians),
		// rotate it around the Z-axis by hdg - Math.PI/2.
		this.rotation.z = hdg - Math.PI / 2;

		this.position.copy( position );

	}


}
