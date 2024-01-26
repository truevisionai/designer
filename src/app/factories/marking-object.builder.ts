/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { TvObjectMarking } from '../map/models/tv-object-marking';
import { ObjectTypes } from 'app/map/models/tv-common';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';

export class MarkingObjectBuilder {

	static createParkingSpaceMarking ( roadObject: TvRoadObject ): Object3D {

		const object3D = new Object3D();

		object3D.name = 'object:' + roadObject.attr_type;

		// const bbox = this.createBoundingBox( roadObject );

		// object3D.add( bbox );

		return object3D;

	}

	static createBoundingBox ( roadObject: TvRoadObject ): Object3D {

		const boxGeometry = new BoxGeometry( roadObject.width, roadObject.length, roadObject.height );

		const bbox = new Mesh( boxGeometry, new MeshBasicMaterial( { color: '#00ff00', wireframe: true } ) );

		bbox.name = 'object:' + roadObject.attr_type + ':bbox';

		return bbox;
	}

	static createMesh ( roadObject: TvRoadObject ): Object3D {

		const object3D = new Object3D();

		object3D.name = 'object:' + roadObject.attr_type;

		roadObject.markings.forEach( marking => {

			object3D.add( this.createMarkingMesh( roadObject, marking ) );

		} );

		return object3D;
	}

	static createMarkingMesh ( roadObject: TvRoadObject, marking: TvObjectMarking ) {

		const points: Vector3[] = [];

		roadObject.outlines.forEach( outline => {

			outline.cornerRoad.forEach( cornerRoad => {

				if ( marking.cornerReferences.includes( cornerRoad.attr_id ) ) {

					points.push( cornerRoad.position );

				}

			} );

		} );

		let geometry: BufferGeometry;

		if ( points.length < 2 && marking.side != null && roadObject.attr_type == ObjectTypes.parkingSpace ) {

			const side = marking.side == 'left' ? 1 : -1;

			const startPosition = new Vector3( -roadObject.width * 0.5 * side, -roadObject.length / 2, -roadObject.height / 2 );
			const endPosition = new Vector3( -roadObject.width * 0.5 * side, roadObject.length / 2, -roadObject.height / 2 );

			// // If the bounding box is rotated, apply the same rotation to the start and end points
			// if ( mesh ) startPosition.applyQuaternion( mesh.quaternion );
			// if ( mesh ) endPosition.applyQuaternion( mesh.quaternion );

			// if ( mesh ) startPosition.add( mesh.position );
			// if ( mesh ) endPosition.add( mesh.position );

			geometry = this.createGeometryFromPoint( marking, startPosition, endPosition );

		} else {

			const curve = new CatmullRomCurve3( points, false, 'catmullrom', 0 );

			geometry = this.createGeometryFromCurve( marking, curve );

		}


		const object3D = new Mesh( geometry, marking.material );

		object3D.name = 'marking';

		return object3D;
	}

	// with spline
	private static createGeometryFromCurve ( marking: TvObjectMarking, curve: CatmullRomCurve3 ): BufferGeometry {

		const totalLength = curve.getLength();
		const fullStripeLength = marking.lineLength + marking.spaceLength;
		const numFullStripes = Math.floor( totalLength / fullStripeLength );
		const positions = [];
		const indices = [];
		const uvs = [];

		for ( let i = 0; i < numFullStripes; i++ ) {
			const uStart = i * fullStripeLength / totalLength;
			const uEnd = ( i * fullStripeLength + marking.lineLength ) / totalLength;
			const distanceStart = uStart * totalLength;
			const distanceEnd = uEnd * totalLength;
			const tStart = curve.getUtoTmapping( uStart, distanceStart );
			const tEnd = curve.getUtoTmapping( uEnd, distanceEnd );
			const start = curve.getPoint( tStart );
			const end = curve.getPoint( tEnd );
			const tangentStart = curve.getTangent( tStart );
			const tangentEnd = curve.getTangent( tEnd );
			const perpendicularStart = new Vector3( -tangentStart.y, tangentStart.x, tangentStart.z ).multiplyScalar( marking.width / 2 );
			const perpendicularEnd = new Vector3( -tangentEnd.y, tangentEnd.x, tangentEnd.z ).multiplyScalar( marking.width / 2 );
			const startIndex = positions.length / 3;

			const frontLeft = start.clone().add( perpendicularStart );
			const frontRight = start.clone().sub( perpendicularStart );
			const backLeft = end.clone().add( perpendicularEnd );
			const backRight = end.clone().sub( perpendicularEnd );

			positions.push( frontLeft.x, frontLeft.y, start.z + marking.zOffset );			// 0-front-left-top
			positions.push( backLeft.x, backLeft.y, start.z + marking.zOffset );				// 4-back-left-top
			positions.push( backRight.x, backRight.y, start.z + marking.zOffset );			// 6-back-right-top
			positions.push( frontRight.x, frontRight.y, start.z + marking.zOffset );			// 2-front-right-top

			indices.push(
				startIndex + 0, startIndex + 3, startIndex + 2,
				startIndex + 0, startIndex + 2, startIndex + 1
			);

			uvs.push( 0, 0 );
			uvs.push( marking.lineLength, 0 );
			uvs.push( marking.lineLength, marking.width );
			uvs.push( 0, marking.width );

		}

		const geometry = new BufferGeometry();
		geometry.setIndex( indices );
		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
		geometry.computeVertexNormals();

		return geometry;
		// return new Mesh( geometry, marking.material );
	}

	static createGeometryFromPoint ( marking: TvObjectMarking, start: Vector3, end: Vector3 ): BufferGeometry {

		const curve = new CatmullRomCurve3( [ start, end ], false, 'catmullrom', 0 );

		return this.createGeometryFromCurve( marking, curve );
	}

	private static createZebraCrossingInPolygon ( marking: TvObjectMarking, vertices: Vector3[] ) {

		const curve = new CatmullRomCurve3( [
			new Vector3( 0, 0, 0 ),
			new Vector3( 0, 7.2, 0 ),
		] );

		const totalLength = curve.getLength();
		const fullStripeLength = marking.lineLength + marking.spaceLength;
		const numFullStripes = Math.floor( totalLength / fullStripeLength );
		const positions = [];
		const indices = [];
		const colors = [];
		const color = new Color( marking.color );

		for ( let i = 0; i < numFullStripes; i++ ) {

			const uStart = i * fullStripeLength / totalLength;
			const uEnd = ( i * fullStripeLength + marking.lineLength ) / totalLength;

			const distanceStart = uStart * totalLength;
			const distanceEnd = uEnd * totalLength;

			const tStart = curve.getUtoTmapping( uStart, distanceStart );
			const tEnd = curve.getUtoTmapping( uEnd, distanceEnd );

			const start = curve.getPoint( tStart );
			const end = curve.getPoint( tEnd );

			const tangentStart = curve.getTangent( tStart );
			const tangentEnd = curve.getTangent( tEnd );

			const perpendicularStart = new Vector3( -tangentStart.y, tangentStart.x, tangentStart.z ).multiplyScalar( ( i + marking.width ) / 2 );
			const perpendicularEnd = new Vector3( -tangentEnd.y, tangentEnd.x, tangentEnd.z ).multiplyScalar( ( i + marking.width ) / 2 );

			const startIndex = positions.length / 3;
			const cornersStart = [
				start.clone().add( perpendicularStart ),
				start.clone().sub( perpendicularStart )
			];
			const cornersEnd = [
				end.clone().add( perpendicularEnd ),
				end.clone().sub( perpendicularEnd )
			];

			cornersStart.forEach( corner => {
				positions.push( corner.x, corner.y, marking.zOffset );
				positions.push( corner.x, corner.y, 0 );
			} );

			cornersEnd.forEach( corner => {
				positions.push( corner.x, corner.y, marking.zOffset );
				positions.push( corner.x, corner.y, 0 );
			} );

			for ( let j = 0; j < 8; j++ ) {
				colors.push( color.r, color.g, color.b );
			}

			// Top face
			indices.push(
				startIndex, startIndex + 2, startIndex + 6,
				startIndex, startIndex + 6, startIndex + 4
			);

			// Bottom face
			indices.push(
				startIndex + 1, startIndex + 3, startIndex + 7,
				startIndex + 1, startIndex + 7, startIndex + 5
			);

			// Side faces
			indices.push(
				startIndex, startIndex + 1, startIndex + 3,
				startIndex, startIndex + 3, startIndex + 2,
				startIndex + 2, startIndex + 3, startIndex + 7,
				startIndex + 2, startIndex + 7, startIndex + 6,
				startIndex + 4, startIndex + 5, startIndex + 7,
				startIndex + 4, startIndex + 7, startIndex + 6,
				startIndex, startIndex + 1, startIndex + 5,
				startIndex, startIndex + 5, startIndex + 4
			);
		}

		const geometry = new BufferGeometry();
		geometry.setIndex( indices );
		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new MeshBasicMaterial( { vertexColors: true } );

		return new Mesh( geometry, material );

	}

	// // version 1
	// static makeMesh ( marking: TvObjectMarking ): Mesh {
	//
	// 	const startPoint = new Vector3( 0, 0, 0 );
	// 	const endPoint = new Vector3( 0, 100, 0 );
	//
	// 	const totalLength = startPoint.distanceTo( endPoint );
	// 	const fullStripeLength = marking.lineLength + marking.spaceLength;
	// 	const numFullStripes = Math.floor( totalLength / fullStripeLength );
	//
	// 	// Create arrays to hold vertex positions and colors
	// 	const positions = [];
	// 	const indices = [];
	// 	const colors = [];
	//
	// 	// Create a color instance to hold the stripe color
	// 	const color = new THREE.Color( marking.color );
	//
	// 	for ( let i = 0; i < numFullStripes; i++ ) {
	// 		// Calculate the y-coordinate of the start and end of the stripe
	// 		const yStart = i * fullStripeLength;
	// 		const yEnd = yStart + marking.lineLength;
	//
	// 		// Calculate the x and z coordinates of the corners of the stripe
	// 		const xStart = marking.startOffset;
	// 		const xEnd = marking.startOffset + marking.width;
	// 		const zBottom = 0;
	// 		const zTop = marking.zOffset;
	// 		const startIndex = positions.length / 3;
	//
	// 		// Add the positions of the 8 vertices of the stripe
	// 		positions.push(
	// 			xStart, yStart, zBottom,
	// 			xEnd, yStart, zBottom,
	// 			xEnd, yEnd, zBottom,
	// 			xStart, yEnd, zBottom,
	// 			xStart, yStart, zTop,
	// 			xEnd, yStart, zTop,
	// 			xEnd, yEnd, zTop,
	// 			xStart, yEnd, zTop
	// 		);
	//
	// 		indices.push(
	// 			startIndex, startIndex + 1, startIndex + 2,
	// 			startIndex, startIndex + 2, startIndex + 3,
	// 			startIndex + 4, startIndex + 5, startIndex + 6,
	// 			startIndex + 4, startIndex + 6, startIndex + 7,
	// 			startIndex, startIndex + 1, startIndex + 5,
	// 			startIndex, startIndex + 5, startIndex + 4,
	// 			startIndex + 3, startIndex + 2, startIndex + 6,
	// 			startIndex + 3, startIndex + 6, startIndex + 7,
	// 			startIndex + 1, startIndex + 2, startIndex + 6,
	// 			startIndex + 1, startIndex + 6, startIndex + 5,
	// 			startIndex, startIndex + 3, startIndex + 7,
	// 			startIndex, startIndex + 7, startIndex + 4
	// 		);
	//
	// 		// Add the color of the stripe
	// 		for ( let j = 0; j < 8; j++ ) {
	// 			colors.push( color.r, color.g, color.b );
	// 		}
	// 	}
	//
	// 	// Create the BufferGeometry and set the position and color attributes
	// 	const geometry = new THREE.BufferGeometry();
	// 	geometry.setIndex( indices );
	// 	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	// 	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
	//
	// 	// Create a MeshBasicMaterial that uses vertex colors
	// 	const material = new THREE.MeshBasicMaterial( { vertexColors: true } );
	//
	// 	// Create and return the mesh
	// 	return new THREE.Mesh( geometry, material );
	// }
	//
	// // optimized version with less triangles
	// static makeMeshV2 ( marking: TvObjectMarking ): Mesh {
	//
	// 	const startPoint = new Vector3( 0, 0, 0 );
	// 	const endPoint = new Vector3( 0, 100, 0 );
	//
	// 	const totalLength = startPoint.distanceTo( endPoint );
	// 	const fullStripeLength = marking.lineLength + marking.spaceLength;
	// 	const numFullStripes = Math.floor( totalLength / fullStripeLength );
	//
	// 	// Create arrays to hold vertex positions and colors
	// 	const positions = [];
	// 	const indices = [];
	// 	const colors = [];
	//
	// 	// Create a color instance to hold the stripe color
	// 	const color = new THREE.Color( marking.color );
	//
	// 	for ( let s = 0; s < numFullStripes; s++ ) {
	//
	// 		// Calculate the y-coordinate of the start and end of the stripe
	// 		const yStart = s * fullStripeLength;
	// 		const yEnd = yStart + marking.lineLength;
	//
	// 		// Calculate the x and z coordinates of the corners of the stripe
	// 		const xStart = marking.startOffset;
	// 		const xEnd = marking.startOffset + marking.width;
	//
	// 		const zBottom = 0;
	// 		const zTop = marking.zOffset;
	//
	// 		const startIndex = positions.length / 3;
	//
	// 		// Add the positions of the 8 vertices of the stripe
	// 		positions.push(
	// 			xStart, yStart, zTop,
	// 			xEnd, yStart, zTop,
	// 			xEnd, yEnd, zTop,
	// 			xStart, yEnd, zTop,
	// 			xStart, yStart, zBottom,
	// 			xEnd, yStart, zBottom,
	// 			xEnd, yEnd, zBottom,
	// 			xStart, yEnd, zBottom
	// 		);
	//
	// 		// Top face
	// 		indices.push( startIndex, startIndex + 1, startIndex + 2, startIndex, startIndex + 2, startIndex + 3 );
	//
	// 		// Side faces
	// 		indices.push( startIndex + 4, startIndex + 5, startIndex + 1, startIndex + 4, startIndex + 1, startIndex );
	// 		indices.push( startIndex + 5, startIndex + 6, startIndex + 2, startIndex + 5, startIndex + 2, startIndex + 1 );
	// 		indices.push( startIndex + 6, startIndex + 7, startIndex + 3, startIndex + 6, startIndex + 3, startIndex + 2 );
	// 		indices.push( startIndex + 7, startIndex + 4, startIndex, startIndex + 7, startIndex, startIndex + 3 );
	//
	// 		// Add the color of the stripe
	// 		for ( let j = 0; j < 8; j++ ) {
	// 			colors.push( color.r, color.g, color.b );
	// 		}
	// 	}
	//
	// 	// Create the BufferGeometry and set the position and color attributes
	// 	const geometry = new THREE.BufferGeometry();
	// 	geometry.setIndex( indices );
	// 	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	// 	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
	//
	// 	// Create a MeshBasicMaterial that uses vertex colors
	// 	const material = new THREE.MeshBasicMaterial( { vertexColors: true, wireframe: true } );
	//
	// 	// Create and return the mesh
	// 	return new THREE.Mesh( geometry, material );
	// }
	//
	// // correct with on left/right + position affect
	// static makeMeshV3 ( marking: TvObjectMarking ): Mesh {
	//
	// 	const startPoint = new Vector3( 10, 0, 0 );
	// 	const endPoint = new Vector3( 10, 100, 0 );
	//
	// 	const direction = endPoint.clone().sub( startPoint ).normalize();
	// 	const perpendicular = new THREE.Vector3( -direction.y, direction.x, direction.z ).multiplyScalar( marking.width / 2 );
	// 	const totalLength = startPoint.distanceTo( endPoint );
	// 	const fullStripeLength = marking.lineLength + marking.spaceLength;
	// 	const numFullStripes = Math.floor( totalLength / fullStripeLength );
	// 	const positions = [];
	// 	const indices = [];
	// 	const colors = [];
	// 	const color = new THREE.Color( marking.color );
	//
	// 	for ( let i = 0; i < numFullStripes; i++ ) {
	// 		const start = startPoint.clone().add( direction.clone().multiplyScalar( i * fullStripeLength ) );
	// 		const end = start.clone().add( direction.clone().multiplyScalar( marking.lineLength ) );
	// 		const startIndex = positions.length / 3;
	// 		const corners = [
	// 			start.clone().add( perpendicular ),
	// 			start.clone().sub( perpendicular ),
	// 			end.clone().add( perpendicular ),
	// 			end.clone().sub( perpendicular )
	// 		];
	//
	// 		corners.forEach( corner => {
	// 			positions.push( corner.x, corner.y, marking.zOffset );
	// 			positions.push( corner.x, corner.y, 0 );
	// 		} );
	//
	// 		for ( let j = 0; j < 8; j++ ) {
	// 			colors.push( color.r, color.g, color.b );
	// 		}
	//
	// 		// Top face
	// 		indices.push(
	// 			startIndex, startIndex + 2, startIndex + 6,
	// 			startIndex, startIndex + 6, startIndex + 4
	// 		);
	//
	// 		// Bottom face
	// 		indices.push(
	// 			startIndex + 1, startIndex + 3, startIndex + 7,
	// 			startIndex + 1, startIndex + 7, startIndex + 5
	// 		);
	//
	// 		// Side faces
	// 		indices.push(
	// 			startIndex, startIndex + 1, startIndex + 3,
	// 			startIndex, startIndex + 3, startIndex + 2,
	// 			startIndex + 2, startIndex + 3, startIndex + 7,
	// 			startIndex + 2, startIndex + 7, startIndex + 6,
	// 			startIndex + 4, startIndex + 5, startIndex + 7,
	// 			startIndex + 4, startIndex + 7, startIndex + 6,
	// 			startIndex, startIndex + 1, startIndex + 5,
	// 			startIndex, startIndex + 5, startIndex + 4
	// 		);
	// 	}
	//
	// 	const geometry = new THREE.BufferGeometry();
	// 	geometry.setIndex( indices );
	// 	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
	// 	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
	//
	// 	const material = new THREE.MeshBasicMaterial( { vertexColors: true } );
	//
	// 	return new THREE.Mesh( geometry, material );
	//
	// }

}
