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
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { TvLaneType } from "../../map/models/tv-common";
import { GeometryUtils } from '../surface/geometry-utils';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionBuilder {

	constructor (
		public roadBuilder: RoadBuilder,
		public boundaryBuilder: TvJunctionBoundaryBuilder
	) {
	}

	build ( junction: TvJunction ): Mesh {

		// NOTE: This is a temporary implementation to visualize the junction
		// NOTE: This does not work

		const connnections = junction.getConnections();

		const connectingRoads = connnections.map( connection => connection.connectingRoad );

		const roadGeometries: BufferGeometry[] = [];

		connectingRoads.forEach( road =>

			road.laneSections.forEach( laneSection =>

				laneSection.getLaneArray().forEach( lane => {

					if ( lane.id == 0 ) return;

					if ( !lane.gameObject ) return;

					if ( lane.type != TvLaneType.driving ) return;

					roadGeometries.push( lane.gameObject.geometry );

				} )
			) );

		const geometry = BufferGeometryUtils.mergeGeometries( roadGeometries );

		// Create geometry from triangulated points
		const junctionGeometry = GeometryUtils.createPolygonFromBufferGeometry( geometry );

		// Create material and mesh
		const material = new MeshStandardMaterial( { color: 0x0000FF, side: DoubleSide } );

		return new Mesh( junctionGeometry, material );

	}

	buildFromRoadCoords ( coords: TvRoadCoord[] ) {

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

	buildBoundaryMesh ( junction: TvJunction ): Mesh {

		return this.boundaryBuilder.build( junction.boundary );

	}

	buildJunctionMesh ( junction: TvJunction ) {

		const coords = junction.getRoadCoords();

		return this.buildFromRoadCoords( coords );

	}

	buildConnectingRoads ( junction: TvJunction ) {

		const connnections = junction.getConnections();

		const connectingRoads = connnections.map( connection => connection.connectingRoad );

		const mesh = new Mesh();

		connectingRoads.forEach( road => {

			const roadMesh = this.roadBuilder.buildRoad( road );

			if ( roadMesh ) {

				mesh.add( roadMesh );

			}

		} );

		return mesh;
	}

	createMeshFromRoads ( roads: TvRoad[] ): Mesh {

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

	createMeshFromPosTheta ( coords: TvPosTheta[] ): Mesh {

		const positions: Vector3[] = coords.map( coord => coord.toVector3() );

		return this.createLinedShapeMesh( positions );

	}

	createMeshFromRoadCoord ( coords: TvRoadCoord[] ): Mesh {

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

	createPolygonalMesh ( positions: Vector3[] ): Mesh {

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

	createSmoothShapeMesh ( positions: Vector3[] ): Mesh {

		const positions2D = positions.map( p => new Vector2( p.x, p.y ) );

		const shape = new Shape();

		const first = positions2D.shift();

		shape.moveTo( first.x, first.y );

		shape.splineThru( positions2D );

		const geometry = new ShapeGeometry( shape );

		const mesh = new Mesh( geometry, this.junctionMaterial );

		return mesh;

	}

	createLinedShapeMesh ( positions: Vector3[] ): Mesh {

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

		const map = this.getJunctionTexture();

		return new MeshStandardMaterial( { map: map, side: FrontSide } );
	}
}
