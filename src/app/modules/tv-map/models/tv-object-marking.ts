/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MarkingObjectFactory } from 'app/core/factories/marking-object.factory';
import * as THREE from 'three';
import { CatmullRomCurve3, Mesh, Vector3 } from 'three';
import { TvColors, TvRoadMarkWeights, TvSide } from './tv-common';
import { TvCornerRoad, TvRoadObject } from './tv-road-object';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { RoadFactory } from 'app/core/factories/road-factory.service';

export class TvObjectMarking {

	roadObject: TvRoadObject;
	node: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;

	private _material: THREE.MeshBasicMaterial;
	private _materialGuid: string;

	/**
	 * Specifies a marking that is either attached to one side of the
	 * object’s bounding box or referencing outline points.
	 *
	 * @param side Side of the bounding box described in <object> element in the local coordinate system u/v
	 * @param weight optical "weight" of the marking
	 * @param color  color of the marking
	 * @param spaceLength Length of the gap between the visible parts
	 * @param lineLength length of a line segment between two spaces
	 * @param startOffset Lateral offset in u-direction from start of bounding box side where the first marking starts
	 * @param stopOffset Lateral offset in u-direction from end of bounding box side where the marking ends
	 * @param zOffset Height of road mark above the road, i.e. thickness of the road mark
	 * @param width width of the marking (attribute is optional if detailed definition is given below)
	 */
	constructor (
		public color: TvColors = TvColors.WHITE,
		public spaceLength: number = 0.3,
		public lineLength: number = 0.3,
		public side: TvSide = TvSide.FRONT,
		public weight: TvRoadMarkWeights = TvRoadMarkWeights.STANDARD,
		public startOffset: number = 0,
		public stopOffset: number = 0,
		public zOffset: number = 0.005,
		public width: number = 1.83,
		public cornerReferences: number[] = [] // 2 or more corners,
	) {
		this._material = new THREE.MeshBasicMaterial( { color: color } );
	}

	get material (): THREE.MeshBasicMaterial {
		return this._material;
	}

	set material ( value: THREE.MeshBasicMaterial ) {
		this._material = value;
	}

	get materialGuid (): string {
		return this._materialGuid;
	}

	set materialGuid ( value: string ) {
		this._materialGuid = value;
		this._material = AssetDatabase.getInstance( value );
		this._material.needsUpdate = true;
		this.update();
	}

	// with spline
	static makeFromSpline ( marking: TvObjectMarking, curve: CatmullRomCurve3 ): Mesh {

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
			const perpendicularStart = new THREE.Vector3( -tangentStart.y, tangentStart.x, tangentStart.z ).multiplyScalar( marking.width / 2 );
			const perpendicularEnd = new THREE.Vector3( -tangentEnd.y, tangentEnd.x, tangentEnd.z ).multiplyScalar( marking.width / 2 );
			const startIndex = positions.length / 3;

			const frontLeft = start.clone().add( perpendicularStart );
			const frontRight = start.clone().sub( perpendicularStart );
			const backLeft = end.clone().add( perpendicularEnd );
			const backRight = end.clone().sub( perpendicularEnd );

			positions.push( frontLeft.x, frontLeft.y, marking.zOffset );			// 0-front-left-top
			positions.push( backLeft.x, backLeft.y, marking.zOffset );				// 4-back-left-top
			positions.push( backRight.x, backRight.y, marking.zOffset );			// 6-back-right-top
			positions.push( frontRight.x, frontRight.y, marking.zOffset );			// 2-front-right-top

			indices.push(
				startIndex + 0, startIndex + 3, startIndex + 2,
				startIndex + 0, startIndex + 2, startIndex + 1
			);

			uvs.push( 0, 0 );
			uvs.push( marking.lineLength, 0 );
			uvs.push( marking.lineLength, marking.width );
			uvs.push( 0, marking.width );

		}

		const geometry = new THREE.BufferGeometry();
		geometry.setIndex( indices );
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
		geometry.computeVertexNormals();

		return new THREE.Mesh( geometry, marking.material );
	}

	static createZebraCrossingInPolygon ( marking: TvObjectMarking, vertices: THREE.Vector3[] ) {

		const curve = new THREE.CatmullRomCurve3( [
			new Vector3( 0, 0, 0 ),
			new Vector3( 0, 7.2, 0 ),
		] );

		const totalLength = curve.getLength();
		const fullStripeLength = marking.lineLength + marking.spaceLength;
		const numFullStripes = Math.floor( totalLength / fullStripeLength );
		const positions = [];
		const indices = [];
		const colors = [];
		const color = new THREE.Color( marking.color );

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

			const perpendicularStart = new THREE.Vector3( -tangentStart.y, tangentStart.x, tangentStart.z ).multiplyScalar( ( i + marking.width ) / 2 );
			const perpendicularEnd = new THREE.Vector3( -tangentEnd.y, tangentEnd.x, tangentEnd.z ).multiplyScalar( ( i + marking.width ) / 2 );

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

		const geometry = new THREE.BufferGeometry();
		geometry.setIndex( indices );
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

		const material = new THREE.MeshBasicMaterial( { vertexColors: true } );

		return new THREE.Mesh( geometry, material );

	}

	addCornerRoad ( corner: TvCornerRoad ) {

		this.cornerReferences.push( corner.attr_id );

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

	removeCornerRoad ( tvCornerRoad: TvCornerRoad ) {

		const index = this.cornerReferences.indexOf( tvCornerRoad.attr_id );

		if ( index > -1 ) {
			this.cornerReferences.splice( index, 1 );
		}

	}

	update (): void {

		if ( !this.roadObject ) return;

		this.roadObject.remove( this.node );

		this.node = MarkingObjectFactory.createMarking( this.roadObject, this );

		this.roadObject.add( this.node );

	}

}


