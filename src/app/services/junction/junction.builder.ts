/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import {
	BufferAttribute,
	BufferGeometry,
	DoubleSide,
	FrontSide,
	Mesh,
	MeshStandardMaterial,
	RepeatWrapping,
	Shape,
	ShapeGeometry,
	Texture,
	Vector2,
	Vector3
} from 'three';
import earcut from 'earcut';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { OdTextures } from 'app/deprecated/od.textures';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoadLinkType } from "../../map/models/tv-road-link";
import { TvJunctionBoundaryBuilder } from 'app/map/junction-boundary/tv-junction-boundary.builder';
import { RoadBuilder } from 'app/map/builders/road.builder';
import { RoadService } from '../road/road.service';
import { TvLaneType } from 'app/map/models/tv-common';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { SplineBuilder } from '../spline/spline.builder';
import { SplineType } from 'app/core/shapes/abstract-spline';
import { TvMaterialService } from 'app/graphics/material/tv-material.service';

const ASPHALT_GUID = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionBuilder {

	constructor (
		public roadService: RoadService,
		public roadBuilder: RoadBuilder,
		public boundaryBuilder: TvJunctionBoundaryBuilder,
		public splineBuilder: SplineBuilder,
		public materialService: TvMaterialService,
	) {
	}

	build ( junction: TvJunction ) {

		const geometry = this.boundaryBuilder.getBufferGeometry( junction.boundary, 'shape' );

		return new Mesh( geometry, this.junctionMaterial );

	}

	buildFromBoundary ( junction: TvJunction ): Mesh {

		return this.boundaryBuilder.buildViaShape( junction.boundary );

	}

	buildFromConnectionV2 ( junction: TvJunction ): Mesh {

		// return new Mesh();

		// NOTE: This is a temporary implementation to visualize the junction
		// NOTE: This does not work

		const geometries = [];

		const connnections = junction.getConnections();

		const connectingRoads = connnections.map( connection => connection.connectingRoad );

		const addRoadGeometries = ( road: TvRoad ) => {

			// if ( road.spline.type === SplineType.EXPLICIT ) return;

			road.laneSections.forEach( laneSection =>

				laneSection.getLaneArray().forEach( lane => {

					if ( lane.id == 0 ) return;

					if ( !lane.gameObject ) return;

					if ( lane.id == 0 ) return;

					if ( lane.type == TvLaneType.sidewalk ) return;

					geometries.push( lane.gameObject.geometry );

				} )

			);

		};

		junction.corners.map( corner => {

			// if ( corner.connectingRoad.spline.type === SplineType.EXPLICIT ) return;

			corner.connectingRoad.gameObject = this.roadBuilder.buildRoad( corner.connectingRoad );

			addRoadGeometries( corner.connectingRoad );

		} );

		connectingRoads.forEach( road => addRoadGeometries( road ) );

		if ( geometries.length == 0 ) return new Mesh();

		const geometry = BufferGeometryUtils.mergeGeometries( geometries );

		return new Mesh( geometry, this.junctionMaterial );

	}

	// buildMeshFromConnections ( junction: TvJunction ) {

	// 	const sortedLinks = this.roadService.sortLinks( junction.getLinks() );

	// 	const roads: TvRoad[] = [];

	// 	for ( let i = 0; i < sortedLinks.length; i++ ) {

	// 		const linkA = sortedLinks[ i ];

	// 		let rightConnectionCreated = false;

	// 		for ( let j = i + 1; j < sortedLinks.length; j++ ) {

	// 			// check if this is the first and last connection
	// 			const isFirstAndLast = i == 0 && j == sortedLinks.length - 1;

	// 			const isCorner = !rightConnectionCreated && !isFirstAndLast;

	// 			const linkB = sortedLinks[ j ];

	// 			const coordA = this.roadService.findLinkPosition( linkA );

	// 			const coordB = this.roadService.findLinkPosition( linkB );

	// 			if ( !coordA || !coordB ) continue;

	// 			const road = this.roadService.createJoiningRoadFromLinks( linkA, linkB );

	// 			this.roadBuilder.buildRoad( road );

	// 			roads.push( road );

	// 		}

	// 	}

	// 	return this.combineMeshes( roads );

	// }

	private createMeshFromRoads ( roads: TvRoad[] ): Mesh {

		const coords: TvPosTheta[] = [];

		roads.forEach( road => {

			if ( road?.successor?.type == TvRoadLinkType.JUNCTION ) {

				coords.push( road.getEndPosTheta() );

			} else if ( road?.predecessor?.type == TvRoadLinkType.JUNCTION ) {

				coords.push( road.getStartPosTheta() );

			}

		} );

		return this.createMeshFromPosTheta( coords );
	}

	private createMeshFromPosTheta ( coords: TvPosTheta[] ): Mesh {

		const positions: Vector3[] = coords.map( coord => coord.toVector3() );

		return this.createLinedShapeMesh( positions );

	}

	private createMeshFromRoadCoord ( coords: TvRoadCoord[] ): Mesh {

		const positions: Vector3[] = coords.map( coord => coord.position );

		return this.createSmoothShapeMesh( positions );

	}

	// /**
	//  *
	//  * @param positions
	//  * @returns
	//  * @deprecated does not work
	//  */
	// createPolygonalMesh ( positions: Vector3[] ): Mesh {
	// 	const geometry = new BufferGeometry();

	// 	// Flatten the Vector3 array to a vertices array for earcut
	// 	const vertices = positions.flatMap( p => [ p.x, p.y, p.z ] );

	// 	// Compute the bounds of the positions
	// 	let minX = Infinity, maxX = -Infinity;
	// 	let minY = Infinity, maxY = -Infinity;

	// 	positions.forEach( p => {
	// 		if ( p.x < minX ) minX = p.x;
	// 		if ( p.x > maxX ) maxX = p.x;
	// 		if ( p.y < minY ) minY = p.y;
	// 		if ( p.y > maxY ) maxY = p.y;
	// 	} );

	// 	// const rangeX = maxX - minX;
	// 	// const rangeY = maxY - minY;

	// 	// Use Earcut to get the indices array for 2D vertices
	// 	const vertices2D = positions.flatMap( p => [ p.x, p.y ] );
	// 	const indices = earcut( vertices2D );

	// 	// Create BufferAttribute for positions and set it in the geometry
	// 	const positionAttribute = new BufferAttribute( new Float32Array( vertices ), 3 );
	// 	geometry.setAttribute( 'position', positionAttribute );
	// 	geometry.setIndex( indices );

	// 	// Compute normals for the vertices
	// 	geometry.computeVertexNormals();

	// 	// // Create normalized UV mapping for the mesh
	// 	// const uvs = new Float32Array( positions.length * 2 );
	// 	// for ( let i = 0; i < positions.length; i++ ) {
	// 	// 	// Normalize the x and y coordinates to [0, 1] for UV mapping
	// 	// 	uvs[ i * 2 ] = ( positions[ i ].x - minX ) / rangeX;
	// 	// 	uvs[ i * 2 + 1 ] = ( positions[ i ].y - minY ) / rangeY;
	// 	// }
	// 	// geometry.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

	// 	const models = OdTextures.uv_grid().clone();

	// 	models.wrapS = models.wrapT = RepeatWrapping;

	// 	// Create a mesh with a basic material
	// 	const material = new MeshStandardMaterial( { models: models, side: FrontSide } );

	// 	const mesh = new Mesh( geometry, material );

	// 	return mesh;
	// }

	private createPolygonalMesh ( positions: Vector3[] ): Mesh {

		function sortByAngle ( points, center ) {
			const angles = points.map( point => Math.atan2( point.y - center.y, point.x - center.x ) );
			return points.map( ( point, index ) => ( {
				point,
				index
			} ) ).sort( ( a, b ) => angles[ a.index ] - angles[ b.index ] ).map( sortedObj => sortedObj.point );
		}

		// Calculate the centroid of the points
		let center = new Vector3();
		positions.forEach( p => {
			center.add( p );
		} );
		center.divideScalar( positions.length );

		// Sort the points by angle from the center
		let sortedPositions = sortByAngle( positions, center );

		const geometry = new BufferGeometry();

		// Flatten the Vector3 array to a vertices array for earcut
		const vertices = sortedPositions.flatMap( p => [ p.x, p.y, p.z ] );

		// Use Earcut to get the indices array for 2D vertices
		const vertices2D = sortedPositions.flatMap( p => [ p.x, p.y ] );
		const indices = earcut( vertices2D );

		// Create BufferAttribute for positions and set it in the geometry
		const positionAttribute = new BufferAttribute( new Float32Array( vertices ), 3 );
		geometry.setAttribute( 'position', positionAttribute );
		geometry.setIndex( indices );

		// Compute normals for the vertices
		geometry.computeVertexNormals();

		// Create UV mapping for the mesh
		// Here we models each 1x1 Three.js unit to a 1x1 area in the texture.
		const uvs = new Float32Array( sortedPositions.length * 2 );
		for ( let i = 0; i < sortedPositions.length; i++ ) {
			// Use the x and y sortedPositions directly as UV coordinates
			uvs[ i * 2 ] = sortedPositions[ i ].x;
			uvs[ i * 2 + 1 ] = sortedPositions[ i ].y;
		}
		geometry.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

		const mesh = new Mesh( geometry, this.junctionMaterial );

		return mesh;
	}

	private createSmoothShapeMesh ( positions: Vector3[] ): Mesh {

		const positions2D = positions.map( p => new Vector2( p.x, p.y ) );

		const shape = new Shape();

		const first = positions2D.shift();

		shape.moveTo( first.x, first.y );

		shape.splineThru( positions2D );

		const geometry = new ShapeGeometry( shape );

		const mesh = new Mesh( geometry, this.junctionMaterial );

		return mesh;

	}

	private createLinedShapeMesh ( positions: Vector3[] ): Mesh {

		const shape = new Shape();

		// Use the first vertex to move to the start position
		shape.moveTo( positions[ 0 ].x, positions[ 0 ].y );

		// Create the shape using lines instead of a spline
		positions.slice( 1 ).forEach( p => {
			shape.lineTo( p.x, p.y );
		} );

		// Close the shape if it's not already closed
		shape.lineTo( positions[ 0 ].x, positions[ 0 ].y );

		// Generate geometry from the shape
		const geometry = new ShapeGeometry( shape );

		// Create a mesh from the geometry and material
		const mesh = new Mesh( geometry, this.junctionMaterial );

		return mesh;
	}

	private getJunctionTexture (): Texture {

		// Clone the texture and set wrapping to repeat
		const map = OdTextures.asphalt().clone();

		map.wrapS = map.wrapT = RepeatWrapping;

		return map;

	}

	private get junctionMaterial () {

		const asphalt = this.materialService.getMaterial( ASPHALT_GUID )

		if ( asphalt ) {
			return asphalt.material;
		}

		const map = this.getJunctionTexture();

		return new MeshStandardMaterial( { map: map, side: FrontSide } );
	}

	private combineMeshes ( roads: TvRoad[] ): Mesh {

		const roadGeometries: BufferGeometry[] = [];

		roads.forEach( road =>

			road.laneSections.forEach( laneSection =>

				laneSection.getLaneArray().forEach( lane => {

					if ( lane.id == 0 ) return;

					if ( !lane.gameObject ) return;

					if ( lane.type != TvLaneType.driving ) return;

					roadGeometries.push( lane.gameObject.geometry );

				} )

			) );

		const geometry = BufferGeometryUtils.mergeGeometries( roadGeometries );

		const material = new MeshStandardMaterial( {
			color: 0x0000FF,
			side: DoubleSide
		} );

		return new Mesh( geometry, material );
	}

	private buildFromRoadCoords ( coords: TvRoadCoord[] ): Mesh {

		const points: Vector3[] = [];

		coords.forEach( roadCoord => {

			const s = roadCoord.s;

			const rightT = roadCoord.road.getRightsideWidth( s );
			const leftT = roadCoord.road.getLeftSideWidth( s );

			const leftPosition = roadCoord.road.getPosThetaAt( s ).addLateralOffset( leftT );
			const rightPosition = roadCoord.road.getPosThetaAt( s ).addLateralOffset( -rightT );

			points.push( leftPosition.toVector3() );
			points.push( rightPosition.toVector3() );

		} );

		return this.createPolygonalMesh( points );

	}

}
