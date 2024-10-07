/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Vector3, BufferGeometry, BufferAttribute, Box2, Vector2, CatmullRomCurve3, ExtrudeGeometry, Shape, MeshBasicMaterial, Mesh } from "three";
import { Log } from "app/core/utils/log";
import { TvLink } from "app/map/models/tv-link";
import { TvPosTheta } from "app/map/models/tv-pos-theta";

import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
import earcut from 'earcut';

export class GeometryUtils {

	static sortRoadLinks ( links: TvLink[] ): TvLink[] {

		// clockwise sort

		const points: TvPosTheta[] = links.map( coord => coord.getPosition() );

		const center = GeometryUtils.getCentroid( points.map( p => p.position ) );

		const angles = points.map( point => Math.atan2( point.y - center.y, point.x - center.x ) );

		return links.map( ( point, index ) => ( {
			point,
			index
		} ) ).sort( ( a, b ) => angles[ a.index ] - angles[ b.index ] ).map( sortedObj => sortedObj.point );

	}

	static getCentroid ( positions: Vector3[] ): Vector3 {

		let center = new Vector3();
		positions.forEach( p => center.add( p ) );
		center.divideScalar( positions.length );

		return center;
	}

	static getAngle ( centroid: Vector3, point: Vector3 ): number {

		return Math.atan2( point.y - centroid.y, point.x - centroid.x );

	}

	static sortByAngle ( points: Vector3[], center?: Vector3, clockwise: boolean = false ): Vector3[] {

		const centroid = center || GeometryUtils.getCentroid( points );

		const normalizeAngle = ( angle ) => ( angle + 2 * Math.PI ) % ( 2 * Math.PI );

		return points.sort( ( a, b ) => {
			const angleA = normalizeAngle( Math.atan2( a.y - centroid.y, a.x - centroid.x ) );
			const angleB = normalizeAngle( Math.atan2( b.y - centroid.y, b.x - centroid.x ) );

			if ( clockwise ) {
				return angleB - angleA; // For clockwise order
			} else {
				return angleA - angleB; // For counter-clockwise order
			}
		} );

	}

	static sortPointByAngle ( points: AbstractControlPoint[] ): AbstractControlPoint[] {

		// Calculate the centroid of the points
		let center = GeometryUtils.getCentroid( points.map( p => p.position ) );

		// Sort the points by angle from the center
		let sortedPoints = GeometryUtils.sortByAngle( points.map( p => p.position ), center );

		return sortedPoints.map( p => points.find( point => point.position.equals( p ) ) );

	}

	static sortCoordsByAngle ( coords: TvRoadCoord[], clockwise = false ): TvRoadCoord[] {

		let sortedPoints = GeometryUtils.sortByAngle( coords.map( p => p.position ), null, clockwise );

		return sortedPoints.map( p => coords.find( point => point.position.equals( p ) ) );

	}

	static createPolygonFromBufferGeometry ( geometry: BufferGeometry ): BufferGeometry {

		const vertices = this.makeVerticesFromGeometry( geometry );

		const sortedVertices = this.sortByAngle( vertices );

		const polygonGeometry = new BufferGeometry();

		// Flatten the Vector3 array to a vertices array for earcut
		const verticesArray = sortedVertices.flatMap( p => [ p.x, p.y, p.z ] );

		// Use Earcut to get the indices array for 2D vertices
		const vertices2D = sortedVertices.flatMap( p => [ p.x, p.y ] );

		const indices = earcut( vertices2D );

		// Create BufferAttribute for positions and set it in the geometry
		const positionAttribute = new BufferAttribute( new Float32Array( verticesArray ), 3 );

		polygonGeometry.setAttribute( 'position', positionAttribute );

		polygonGeometry.setIndex( indices );

		// Compute normals for the vertices
		polygonGeometry.computeVertexNormals();

		// Create UV mapping for the mesh
		// Here we models each 1x1 Three.js unit to a 1x1 area in the texture.
		const uvs = new Float32Array( sortedVertices.length * 2 );

		for ( let i = 0; i < sortedVertices.length; i++ ) {

			// Use the x and y positions directly as UV coordinates
			uvs[ i * 2 ] = sortedVertices[ i ].x;

			uvs[ i * 2 + 1 ] = sortedVertices[ i ].y;

		}

		polygonGeometry.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

		return polygonGeometry;

	}

	static createGeometryFromVertices ( positions: Vector3[] ): BufferGeometry {

		const geometry = new BufferGeometry();

		// Ensure all vertices are on the same plane (z = 0 for 2D triangulation)
		const vertices2D = positions.map( p => [ p.x, p.y ] ).flat();
		const indices = earcut( vertices2D );

		// Create BufferAttribute for positions and set it in the geometry
		const vertices = positions.flatMap( p => [ p.x, p.y, p.z ] );
		const positionAttribute = new BufferAttribute( new Float32Array( vertices ), 3 );
		geometry.setAttribute( 'position', positionAttribute );
		geometry.setIndex( indices );

		// Compute normals for the vertices
		geometry.computeVertexNormals();

		// Create UV mapping for the mesh
		const uvs = new Float32Array( positions.length * 2 );
		const boundingBox = new Box2();
		positions.forEach( p => boundingBox.expandByPoint( new Vector2( p.x, p.y ) ) );

		const size = boundingBox.getSize( new Vector2() );
		for ( let i = 0; i < positions.length; i++ ) {
			uvs[ i * 2 ] = ( positions[ i ].x - boundingBox.min.x ) / size.x;
			uvs[ i * 2 + 1 ] = ( positions[ i ].y - boundingBox.min.y ) / size.y;
		}

		geometry.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

		return geometry;

	}

	static makeVerticesFromGeometry ( geometry: BufferGeometry ): Vector3[] {

		let positions = geometry.getAttribute( 'position' ).array;
		let vertices = [];

		for ( let i = 0; i < positions.length; i += 3 ) {
			vertices.push( new Vector3( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] ) );
		}

		return vertices;

	}

	static weldVertices ( vertices: Vector3[], threshold: number = 3 ): Vector3[] {

		const vertexMap = new Map<string, Vector3>();

		vertices.forEach( v => {

			const key = `${ v.x.toFixed( threshold ) }_${ v.y.toFixed( threshold ) }_${ v.z.toFixed( threshold ) }`;

			if ( !vertexMap.has( key ) ) {
				vertexMap.set( key, v );
			}

		} );

		return Array.from( vertexMap.values() );

	}

	static weldBufferGeometry ( geometry: BufferGeometry, threshold: number = 0.001 ) {

		const vertices = geometry.attributes.position.array;
		const weldMap = new Map();

		for ( let i = 0; i < vertices.length; i += 3 ) {

			const key = `${ Math.round( vertices[ i ] / threshold ) }_${ Math.round( vertices[ i + 1 ] / threshold ) }_${ Math.round( vertices[ i + 2 ] / threshold ) }`;

			if ( !weldMap.has( key ) ) {

				weldMap.set( key, i );

			} else {

				const index = weldMap.get( key );

				vertices[ i ] = vertices[ index ];
				vertices[ i + 1 ] = vertices[ index + 1 ];
				vertices[ i + 2 ] = vertices[ index + 2 ];
			}

		}

		geometry.attributes.position.needsUpdate = true;

	}

	static findFarthestPoints ( points: Vector3[] ): [ Vector3, Vector3 ] {

		let maxDistance = 0;
		let farthestPoints: [ Vector3, Vector3 ] = [ points[ 0 ], points[ 0 ] ];

		for ( let i = 0; i < points.length; i++ ) {
			for ( let j = i + 1; j < points.length; j++ ) {
				const distance = points[ i ].distanceTo( points[ j ] );
				if ( distance > maxDistance ) {
					maxDistance = distance;
					farthestPoints = [ points[ i ], points[ j ] ];
				}
			}
		}

		return farthestPoints;
	}

	sortPointsByReferenceLine ( points: Vector3[], referenceLine: Vector3 ): Vector3[] {
		return points.sort( ( a, b ) => {
			const projectionA = a.dot( referenceLine );
			const projectionB = b.dot( referenceLine );
			return projectionA - projectionB;
		} );
	}

	static isCollinear ( p1: Vector3, p2: Vector3, p3: Vector3 ): boolean {
		// Calculate the area of the triangle formed by the points
		const area = p1.x * ( p2.y - p3.y ) + p2.x * ( p3.y - p1.y ) + p3.x * ( p1.y - p2.y );
		return Math.abs( area ) < 1e-10; // Use a small threshold to account for floating-point precision
	}

	static ensureNonCollinear ( points: Vector3[] ): Vector3[] {
		// Check if all points are collinear and adjust if necessary
		for ( let i = 0; i < points.length - 2; i++ ) {
			if ( GeometryUtils.isCollinear( points[ i ], points[ i + 1 ], points[ i + 2 ] ) ) {
				// Adjust the third point slightly
				points[ i + 2 ].x += 0.01;
				points[ i + 2 ].y += 0.01;
			}
		}
		return points;
	}

	static createExtrudeGeometry ( points: Vector3[], width = 1.0, height = 0.1 ): BufferGeometry {

		if ( points.length < 2 ) {
			Log.error( 'Not enough points to create extrude geometry' );
			return new BufferGeometry();
		}

		// Create a CatmullRomCurve3 spline
		const spline = new CatmullRomCurve3( points );

		// Define the shape to be extruded (a simple rectangle in this case)
		const shape = new Shape();
		shape.moveTo( -height / 2, -width / 2 );
		shape.lineTo( height / 2, -width / 2 );
		shape.lineTo( height / 2, width / 2 );
		shape.lineTo( -height / 2, width / 2 );
		shape.lineTo( -height / 2, -width / 2 );

		// Define the extrusion settings
		const extrudeSettings = {
			steps: 200,  // Number of points used for the extrude path
			bevelEnabled: false,  // Disable bevels
			extrudePath: spline  // Use the spline as the extrude path
		};

		// Create the extrude geometry
		return new ExtrudeGeometry( shape, extrudeSettings );
	}

	static mergeGeometries ( geometries: BufferGeometry[], useGroups = false ): BufferGeometry {

		return BufferGeometryUtils.mergeGeometries( geometries, useGroups );

	}

	static mergeVertices ( geometry: BufferGeometry, tolerance?: number ): BufferGeometry {

		return BufferGeometryUtils.mergeVertices( geometry, tolerance );

	}

}
