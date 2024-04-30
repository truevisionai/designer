/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import {
	BoxGeometry,
	BufferGeometry,
	CatmullRomCurve3,
	Color,
	Float32BufferAttribute,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	PlaneGeometry,
	Vector3
} from 'three';
import { ObjectTypes, TvSide } from '../models/tv-common';
import { Injectable } from "@angular/core";
import { TvRoad } from "../models/tv-road.model";
import { TvObjectMarking } from 'app/map/models/tv-object-marking';
import { Maths } from 'app/utils/maths';
import { TvCornerLocal } from 'app/map/models/objects/tv-corner-local';
import { TvConsole } from 'app/core/utils/console';
import { ExtrudeService } from '../../factories/extrude.service';
import { TvObjectVertexLocal } from "../models/objects/tv-object-vertex-local";
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry';
import { MeshBuilder } from "../../core/interfaces/mesh.builder";
import { AssetService } from "../../core/asset/asset.service";
import { TvMaterialService } from "../../graphics/material/tv-material.service";
import { TvTextureService } from "../../graphics/texture/tv-texture.service";
import { AssetType } from "../../core/asset/asset.model";
import { COLOR } from "../../views/shared/utils/colors.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadObjectBuilder extends MeshBuilder<TvRoadObject> {

	constructor (
		private extrudeService: ExtrudeService,
		private assetService: AssetService,
		private materialService: TvMaterialService,
		private textureService: TvTextureService,
	) {
		super();
	}

	build ( object: TvRoadObject ): Object3D {

		if ( object.road ) {

			return this.buildRoadObject( object.road, object );

		}

	}

	buildRoadObject ( road: TvRoad, roadObject: TvRoadObject ): Object3D {

		const type: ObjectTypes = roadObject.attr_type;

		switch ( type ) {

			case ObjectTypes.crosswalk:
				return this.buildCrosswalkObject( road, roadObject );

			case ObjectTypes.parkingSpace:
				return this.buildParkingSpaceObject( road, roadObject );

			case ObjectTypes.tree:
				return this.buildTreeObject( road, roadObject );

			case ObjectTypes.vegetation:
				return this.buildVegetationObject( road, roadObject );

			case ObjectTypes.barrier:
				return this.buildBarrierObject( road, roadObject );

			case ObjectTypes.pole:
				return this.buildPoleObject( road, roadObject );

			case ObjectTypes.roadMark:
				return this.buildRoadMarkObject( road, roadObject );
		}

	}

	buildRoadMarkObject ( road: TvRoad, roadObject: TvRoadObject ): Object3D {

		if ( !roadObject.assetGuid ) return;

		const material = this.getRoadMarkMaterial( roadObject.assetGuid );

		const roadCoord = road.getPosThetaAt( roadObject.s, roadObject.t );

		const lane = roadObject.road.getLaneAt( roadObject.s, roadObject.t );

		let geometry: BufferGeometry;

		if ( !lane || lane?.id == 0 ) {

			geometry = new PlaneGeometry( 1, 1 );

			const model = new Mesh( geometry, material );

			model.position.copy( roadCoord.position );

			model.position.z += roadObject.zOffset;

			model.scale.copy( roadObject.scale )

			return model;

		} else {

			geometry = new DecalGeometry( lane.gameObject, roadCoord.position, roadObject.rotation, roadObject.scale )

			const model = new Mesh( geometry, material );

			model.position.z += roadObject.zOffset;

			return model;

		}
	}

	buildPoleObject ( road: TvRoad, roadObject: TvRoadObject ): Object3D {

		const object3D = new Object3D();

		object3D.name = 'object:' + roadObject.attr_type;

		const position = road.getPosThetaAt( roadObject.s, roadObject.t );

		if ( roadObject.skeleton?.polylines.length > 0 ) {

			if ( roadObject.skeleton.polylines[ 0 ].vertices[ 0 ] instanceof TvObjectVertexLocal ) {

				object3D.position.copy( position.position );

			}

			object3D.add( ...this.buildSkeletonMesh( road, roadObject ) );

		}

		object3D.position.z += roadObject.zOffset;

		for ( let i = 0; i < roadObject.getRepeatCount(); i++ ) {

			const repeat = roadObject.getRepeat( i );

			for ( let ds = 0; ds < repeat.length; ds += repeat.distance ) {

				const s = repeat.s + ds;

				const fraction = ds / repeat.length;

				const t = repeat.tStart && repeat.tEnd ?
					Maths.linearInterpolation( repeat.tStart, repeat.tEnd, fraction ) : roadObject.t;

				const width = repeat.widthStart && repeat.widthEnd ?
					Maths.linearInterpolation( repeat.widthStart, repeat.widthEnd, fraction ) : roadObject.width;

				const height = repeat.heightStart && repeat.heightEnd ?
					Maths.linearInterpolation( repeat.heightStart, repeat.heightEnd, fraction ) : roadObject.height;

				const zOffset = repeat.zOffsetStart && repeat.zOffsetEnd ?
					Maths.linearInterpolation( repeat.zOffsetStart, repeat.zOffsetEnd, fraction ) : roadObject.zOffset;

				const length = repeat.lengthStart && repeat.lengthEnd ?
					Maths.linearInterpolation( repeat.lengthStart, repeat.lengthEnd, fraction ) : roadObject.length;

				const posTheta = road.getPosThetaAt( s, t );

				const repeatMesh = new Object3D();

				repeatMesh.add( this.buildRoadObjectBbox( roadObject ) );

				repeatMesh.position.copy( posTheta.position );

				repeatMesh.position.z += zOffset;

				// repeatMesh.rotation.set( 0, 0, posTheta.hdg );

				object3D.add( repeatMesh );

			}

		}

		return object3D;

	}

	buildBarrierObject ( road: TvRoad, roadObject: TvRoadObject ): Object3D {

		const object3D = new Object3D();

		roadObject.skeleton.polylines.forEach( polyline => {

			const shape = this.extrudeService.buildShape( polyline );

			const path = road.spline.getPath( roadObject.t );

			const geometry = this.extrudeService.buildExtrudeGeometry( path, shape );

			const mesh = new Mesh( geometry, new MeshStandardMaterial( { color: '#919A9E' } ) );

			object3D.add( mesh );

		} )

		return object3D;
	}

	buildVegetationObject ( road: TvRoad, roadObject: TvRoadObject ): Object3D {

		throw new Error( 'Method not implemented.' );

	}

	buildTreeObject ( road: TvRoad, roadObject: TvRoadObject ): Object3D {

		if ( !roadObject.assetGuid ) {

			TvConsole.error( 'Tree object with asset guid not implemented yet' );

			return;
		}

		const roadObjectMesh = new Object3D();

		for ( let i = 0; i < roadObject.getRepeatCount(); i++ ) {

			const repeat = roadObject.getRepeat( i );

			for ( let ds = 0; ds < repeat.length; ds += repeat.distance ) {

				const s = repeat.s + ds;

				const fraction = ds / repeat.length;

				const width = repeat.widthStart && repeat.widthEnd ?
					Maths.linearInterpolation( repeat.widthStart, repeat.widthEnd, fraction ) : roadObject.width;

				const height = repeat.heightStart && repeat.heightEnd ?
					Maths.linearInterpolation( repeat.heightStart, repeat.heightEnd, fraction ) : roadObject.height;

				const zOffset = repeat.zOffsetStart && repeat.zOffsetEnd ?
					Maths.linearInterpolation( repeat.zOffsetStart, repeat.zOffsetEnd, fraction ) : roadObject.zOffset;

				const length = repeat.lengthStart && repeat.lengthEnd ?
					Maths.linearInterpolation( repeat.lengthStart, repeat.lengthEnd, fraction ) : roadObject.length;

				const t = repeat.tStart && repeat.tEnd ?
					Maths.linearInterpolation( repeat.tStart, repeat.tEnd, fraction ) : roadObject.t;

				const posTheta = road.getPosThetaAt( s, t );

				const repeatMesh = this.assetService.getInstance<Object3D>( roadObject.assetGuid )?.clone();

				repeatMesh.name = 'repeat:' + i;

				repeatMesh.position.copy( posTheta.position );

				repeatMesh.position.z += zOffset;

				roadObjectMesh.add( repeatMesh );

			}

		}

		return roadObjectMesh;

	}

	private buildParkingSpaceObject ( road: TvRoad, roadObject: TvRoadObject ): Object3D {

		// const posTheta = road.getPositionAt( roadObject.s, roadObject.t );

		const roadObjectMesh = new Object3D();

		// roadObjectMesh.name = 'object:' + roadObject.attr_type;

		// roadObjectMesh.position.copy( posTheta.toVector3() );

		// roadObjectMesh.position.z += roadObject.height / 2;

		// roadObjectMesh.rotation.set( 0, 0, posTheta.hdg );

		// roadObject.markings.forEach( marking => {

		// 	roadObjectMesh.add( this.buildMarking( roadObject, marking ) );

		// } )

		for ( let i = 0; i < roadObject.getRepeatCount(); i++ ) {

			const repeat = roadObject.getRepeat( i );

			for ( let s = repeat.s; s < repeat.length; s += repeat.distance ) {

				const fraction = s / repeat.length;

				const width = repeat.widthStart && repeat.widthEnd ?
					Maths.linearInterpolation( repeat.widthStart, repeat.widthEnd, fraction ) : roadObject.width;

				const height = repeat.heightStart && repeat.heightEnd ?
					Maths.linearInterpolation( repeat.heightStart, repeat.heightEnd, fraction ) : roadObject.height;

				const zOffset = repeat.zOffsetStart && repeat.zOffsetEnd ?
					Maths.linearInterpolation( repeat.zOffsetStart, repeat.zOffsetEnd, fraction ) : roadObject.zOffset;

				const length = repeat.lengthStart && repeat.lengthEnd ?
					Maths.linearInterpolation( repeat.lengthStart, repeat.lengthEnd, fraction ) : roadObject.length;

				const t = repeat.tStart && repeat.tEnd ?
					Maths.linearInterpolation( repeat.tStart, repeat.tEnd, fraction ) : roadObject.t;

				const posTheta = road.getPosThetaAt( s, t );

				const repeatMesh = new Object3D();

				repeatMesh.name = 'repeat:' + i;

				repeatMesh.position.copy( posTheta.position );

				repeatMesh.rotation.set( 0, 0, posTheta.hdg );

				repeatMesh.position.z += height / 2;

				roadObjectMesh.add( repeatMesh );

				roadObject.markings.forEach( marking => {

					if ( marking.side ) {

						repeatMesh.add( this.buildMarking( road, roadObject, marking ) );

					} else {

						repeatMesh.add( this.buildMarking( road, roadObject, marking ) );

					}

				} );

			}

		}

		return roadObjectMesh;

	}

	private buildCrosswalkObject ( road: TvRoad, roadObject: TvRoadObject ): Object3D {

		if ( roadObject.markings.length < 1 ) return;

		if ( roadObject.outlines.length < 1 ) return;

		if ( roadObject.markings[ 0 ].cornerReferences.length < 2 ) return;

		const roadObjectMesh = new Object3D();

		roadObjectMesh.name = 'object:' + roadObject.attr_type;

		// const posTheta = road.getPositionAt( roadObject.s, roadObject.t );

		// roadObjectMesh.position.copy( posTheta.toVector3() );

		// roadObjectMesh.position.z += roadObject.height / 2;

		// roadObjectMesh.rotation.set( 0, 0, posTheta.hdg );

		roadObject.markings.forEach( marking => {

			roadObjectMesh.add( this.buildMarking( road, roadObject, marking ) );

		} );

		return roadObjectMesh;
	}

	private buildRoadObjectBbox ( roadObject: TvRoadObject ): Object3D {

		const boxGeometry = new BoxGeometry( roadObject.width, roadObject.length, roadObject.height );

		const bbox = new Mesh( boxGeometry, new MeshBasicMaterial( { color: '#00ff00', wireframe: true } ) );

		bbox.name = 'object:' + roadObject.attr_type + ':bbox';

		return bbox;
	}

	private buildMarking ( road: TvRoad, roadObject: TvRoadObject, marking: TvObjectMarking ) {

		const points: Vector3[] = [];

		if ( marking.side != null && marking.side != TvSide.NONE && roadObject.attr_type == ObjectTypes.parkingSpace ) {

			const side = marking.side == TvSide.LEFT ? 1 : -1;

			const startPosition = new Vector3( -roadObject.width * 0.5 * side, -roadObject.length / 2, -roadObject.height / 2 );
			const endPosition = new Vector3( -roadObject.width * 0.5 * side, roadObject.length / 2, -roadObject.height / 2 );

			points.push( startPosition );
			points.push( endPosition );

		} else {

			roadObject.outlines.forEach( outline => {

				if ( outline.cornerRoad.length >= 2 ) {

					outline.cornerRoad.forEach( cornerRoad => {

						if ( marking.cornerReferences.includes( cornerRoad.attr_id ) ) {

							const position = cornerRoad.getPosition();

							points.push( position );

						}

					} );

				} else if ( outline.cornerLocal.length >= 2 ) {

					outline.cornerLocal.forEach( cornerLocal => {

						if ( marking.cornerReferences.includes( cornerLocal.attr_id ) ) {

							const position = this.getCornerLocalPosition( road, roadObject, cornerLocal );

							points.push( position );

						}

					} );

				}

			} );

		}

		if ( points.length < 2 ) return;

		const curve = new CatmullRomCurve3( points, false, 'catmullrom', 0 );

		const geometry = this.createGeometryFromCurve( marking, curve );

		const object3D = new Mesh( geometry, marking.material );

		object3D.name = 'marking';

		return object3D;
	}

	getCornerLocalPosition ( road: TvRoad, roadObject: TvRoadObject, cornerLocal: TvCornerLocal ) {

		return new Vector3( cornerLocal.attr_u, cornerLocal.attr_v, cornerLocal.attr_z );

		// u is positive to the right
		// lateral position, positive to the left within the inertial x/y plane
		const s = Math.min( 0, Math.max( roadObject.s + cornerLocal.attr_v, road.length ) );

		// v is positive to the top
		const t = roadObject.t - cornerLocal.attr_u;

		const position = road.getPosThetaAt( s, t );

		return position.position;
	}

	private buildSkeletonMesh ( road: TvRoad, roadObject: TvRoadObject ): Object3D[] {

		const objects: Object3D[] = [];

		const geometries = this.extrudeService.buildSkeletonGeometries( roadObject, roadObject.skeleton );

		for ( let i = 0; i < geometries.length; i++ ) {

			objects.push( new Mesh( geometries[ i ], new MeshStandardMaterial( { color: '#919A9E' } ) ) );

		}

		return objects;
	}

	// with spline
	private createGeometryFromCurve ( marking: TvObjectMarking, curve: CatmullRomCurve3 ): BufferGeometry {

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

	private createGeometryFromPoint ( marking: TvObjectMarking, start: Vector3, end: Vector3 ): BufferGeometry {

		const curve = new CatmullRomCurve3( [ start, end ], false, 'catmullrom', 0 );

		return this.createGeometryFromCurve( marking, curve );
	}

	private createZebraCrossingInPolygon ( marking: TvObjectMarking, vertices: Vector3[] ) {

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

	private getRoadMarkMaterial ( assetGuid: string ) {

		const asset = this.assetService.getAsset( assetGuid );

		if ( asset?.type == AssetType.MATERIAL ) {

			return this.materialService.getMaterial( assetGuid ).material;

		} else if ( asset?.type == AssetType.TEXTURE ) {

			const texture = this.textureService.getTexture( assetGuid );

			return new MeshStandardMaterial( {
				map: texture.texture,
				transparent: true,
				alphaTest: 0.9
			} );

		} else {

			return new MeshStandardMaterial( { color: COLOR.MAGENTA } );
		}
	}
}
