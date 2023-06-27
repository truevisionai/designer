import { BufferGeometry, Float32BufferAttribute, Matrix4, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three';
import { OdBuilderConfig } from '../../tv-map/builders/od-builder-config';

export class LaneArrowObject extends Mesh {

	constructor ( position: Vector3, hdg: number ) {

		position.z = position.z + OdBuilderConfig.ROADMARK_ELEVATION_SHIFT;

		// Define a unit arrow, pointing towards +Y direction.
		const arrowVertices = [
			-0.5, 0, 0,  // bottom of the arrow
			0.5, 0, 0,  // right corner of the arrow head
			0, 1, 0,  // tip of the arrow head
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
