/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import {
	TvBoundarySegmentType,
	TvJointBoundary,
	TvJunctionBoundary,
	TvJunctionSegmentBoundary,
	TvLaneBoundary
} from './tv-junction-boundary';
import { TvRoad } from '../models/tv-road.model';
import {
	BufferAttribute,
	BufferGeometry,
	FrontSide,
	Mesh,
	MeshBasicMaterial,
	Shape,
	ShapeGeometry,
	Vector2,
	Vector3
} from 'three';
import { TvContactPoint } from '../models/tv-common';
import { GeometryUtils } from 'app/services/surface/geometry-utils';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { COLOR } from 'app/views/shared/utils/colors.service';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import Delaunator from 'delaunator';
import { Maths } from 'app/utils/maths';
import { JunctionUtils } from 'app/utils/junction.utils';
import { Log } from 'app/core/utils/log';
import { TvJunction } from '../models/junctions/tv-junction';
import { JunctionOverlay } from 'app/services/junction/junction-overlay';

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryBuilder {

	private static _instance: TvJunctionBoundaryBuilder;

	static get instance (): TvJunctionBoundaryBuilder {

		if ( !TvJunctionBoundaryBuilder._instance ) {
			TvJunctionBoundaryBuilder._instance = new TvJunctionBoundaryBuilder();
		}

		return TvJunctionBoundaryBuilder._instance;
	}

	/**
	 * Useful for debugging the boundary
	 * @param boundary
	 */
	private debugDrawBoundary ( boundary: TvJunctionBoundary ) {

		let points = this.convertBoundaryToPositions( boundary );

		// Draw the
		points.forEach( ( p, index ) => {

			// Draw the point as a green sphere
			DebugDrawService.instance.drawSphere( p.clone(), 0.1, COLOR.GREEN );

			// Draw lines between consecutive points
			const nextIndex = ( index + 1 ) % points.length;

			DebugDrawService.instance.drawLine( [ p.clone(), points[ nextIndex ].clone() ], COLOR.BLUE, 1 );

		} );

		const center = GeometryUtils.getCentroid( points );

		DebugDrawService.instance.drawSphere( center.clone(), 1.0, COLOR.RED );

	}

	getBufferGeometry ( boundary: TvJunctionBoundary, via: 'shape' | 'delaunay' ): BufferGeometry {

		let geometry: BufferGeometry = null;

		if ( via == 'shape' ) {
			geometry = this.getShapeGeometry( boundary );
		} else if ( via == 'delaunay' ) {
			geometry = this.getDeluanayGeometry( boundary );
		}

		return geometry;
	}

	private getShapeGeometry ( boundary: TvJunctionBoundary ): ShapeGeometry {

		// const shape = this.convertBoundaryToShape( boundary );
		// const shape = this.convertBoundaryToShapeSimple( boundary );

		const points = this.convertBoundaryToPositions( boundary );

		if ( points.length < 3 ) {
			Log.error( 'Invalid boundary points', points.length );
			return new ShapeGeometry( new Shape() );
		}

		// const shape = this.convertBoundaryToShapeSimple( boundary );
		const shape = this.convertBoundaryToShapeComplex( boundary );

		return new ShapeGeometry( shape );
	}

	private getDeluanayGeometry ( boundary: TvJunctionBoundary ): BufferGeometry {

		const points = this.convertBoundaryToPositions( boundary );

		// Convert points to a flat array for Delaunator
		const vertices = points.reduce( ( acc, point ) => acc.concat( [ point.x, point.y ] ), [] );

		// Perform Delaunay triangulation
		const delaunay = new Delaunator( vertices );
		const triangles: Uint32Array = delaunay.triangles;

		// Create geometry
		const geometry = new BufferGeometry();
		const verticesArray = new Float32Array( points.length * 3 );
		for ( let i = 0; i < points.length; i++ ) {
			verticesArray[ i * 3 ] = points[ i ].x;
			verticesArray[ i * 3 + 1 ] = points[ i ].y;
			verticesArray[ i * 3 + 2 ] = 0; // Z-coordinate
		}

		geometry.setAttribute( 'position', new BufferAttribute( verticesArray, 3 ) );
		geometry.setIndex( new BufferAttribute( triangles, 1 ) );

		return geometry;
	}

	buildViaShape ( junction: TvJunction, boundary: TvJunctionBoundary ): Mesh {

		const geometry = this.getBufferGeometry( boundary, 'shape' );

		return JunctionOverlay.create( junction, geometry );

	}

	// buildViaPoly2Tri ( boundary: TvJunctionBoundary ): Mesh {

	// 	const points = this.convertBoundaryToPositions( boundary );

	// 	// Convert points to poly2tri points
	// 	const polyPoints = points.map( p => new poly2tri.Point( p.x, p.y ) );

	// 	// Initialize CDT with the polyline
	// 	const sweep = new poly2tri.SweepContext( polyPoints );

	// 	// Perform the triangulation
	// 	sweep.triangulate();

	// 	// Retrieve the triangles
	// 	const triangles = sweep.getTriangles();

	// 	// Prepare vertices and indices for Three.js geometry
	// 	const verticesArray = [];
	// 	const indicesArray = [];

	// 	triangles.forEach( triangle => {
	// 		const pts = triangle.getPoints();
	// 		const baseIndex = verticesArray.length / 3;
	// 		pts.forEach( p => {
	// 			verticesArray.push( p.x, p.y, 0 ); // Z-coordinate is 0
	// 		} );
	// 		indicesArray.push( baseIndex, baseIndex + 1, baseIndex + 2 );
	// 	} );

	// 	// Create geometry
	// 	const geometry = new BufferGeometry();
	// 	geometry.setAttribute( 'position', new Float32BufferAttribute( verticesArray, 3 ) );
	// 	geometry.setIndex( indicesArray );

	// 	// Create mesh
	// 	const mesh = new Mesh( geometry, new MeshBasicMaterial( { color: 0x00ff00, side: FrontSide } ) );

	// 	return mesh;

	// }

	buildViaDelaunay ( boundary: TvJunctionBoundary ): Mesh {

		const points = this.convertBoundaryToPositions( boundary );

		// Convert points to a flat array for Delaunator
		const vertices = points.reduce( ( acc, point ) => acc.concat( [ point.x, point.y ] ), [] );

		// Perform Delaunay triangulation
		const delaunay = new Delaunator( vertices );
		const triangles: Uint32Array = delaunay.triangles;

		// Create geometry
		const geometry = new BufferGeometry();
		const verticesArray = new Float32Array( points.length * 3 );
		for ( let i = 0; i < points.length; i++ ) {
			verticesArray[ i * 3 ] = points[ i ].x;
			verticesArray[ i * 3 + 1 ] = points[ i ].y;
			verticesArray[ i * 3 + 2 ] = 0; // Z-coordinate
		}
		geometry.setAttribute( 'position', new BufferAttribute( verticesArray, 3 ) );
		geometry.setIndex( new BufferAttribute( triangles, 1 ) );

		const mesh = new Mesh( geometry, new MeshBasicMaterial( { color: 0x00ff00, side: FrontSide } ) );

		return mesh;
	}

	// buildViaDelaunayv2 ( boundary: TvJunctionBoundary ): Mesh {

	// 	let points = this.convertBoundaryToPositions( boundary );

	// 	points = GeometryUtils.sortByAngle( points, null, true );

	// 	points.forEach( p => DebugDrawService.instance.drawSphere( p.clone(), 0.1, COLOR.GREEN ) );

	// 	// Convert points to a flat array for Delaunator
	// 	const vertices = points.reduce( ( acc, point ) => acc.concat( [ point.x, point.y ] ), [] );

	// 	// Perform Delaunay triangulation
	// 	const delaunay = new Delaunator( vertices );
	// 	const triangles: Uint32Array = delaunay.triangles;

	// 	// Create geometry
	// 	// Create geometry
	// 	const geometry = new BufferGeometry();
	// 	const verticesArray = new Float32Array( points.length * 3 );
	// 	for ( let i = 0; i < points.length; i++ ) {
	// 		verticesArray[ i * 3 ] = points[ i ].x;
	// 		verticesArray[ i * 3 + 1 ] = points[ i ].y;
	// 		verticesArray[ i * 3 + 2 ] = 0; // Z-coordinate
	// 	}
	// 	geometry.setAttribute( 'position', new BufferAttribute( verticesArray, 3 ) );
	// 	geometry.setIndex( new BufferAttribute( triangles, 1 ) );

	// 	// Define the clipping polygon in counter-clockwise order
	// 	// const clippingPolygon = [
	// 	// 	{ X: 0, Y: 0 },
	// 	// 	{ X: 10, Y: 0 },
	// 	// 	{ X: 10, Y: 10 },
	// 	// 	{ X: 0, Y: 10 }
	// 	// ];
	// 	const clippingPolygon = points.map( p => { return { X: p.x, Y: p.y } } );

	// 	// Convert Delaunay triangles to jsclipper format
	// 	const subjectPolygon = [];
	// 	for ( let i = 0; i < triangles.length; i += 3 ) {
	// 		subjectPolygon.push( [
	// 			{ X: vertices[ triangles[ i ] * 2 ], Y: vertices[ triangles[ i ] * 2 + 1 ] },
	// 			{ X: vertices[ triangles[ i + 1 ] * 2 ], Y: vertices[ triangles[ i + 1 ] * 2 + 1 ] },
	// 			{ X: vertices[ triangles[ i + 2 ] * 2 ], Y: vertices[ triangles[ i + 2 ] * 2 + 1 ] }
	// 		] );
	// 	}

	// 	// Use jsclipper to clip the polygon
	// 	const clipper = new ClipperLib.Clipper();
	// 	clipper.AddPaths( subjectPolygon, ClipperLib.PolyType.ptSubject, true );
	// 	clipper.AddPath( clippingPolygon, ClipperLib.PolyType.ptClip, true );

	// 	const solution = new ClipperLib.Paths();
	// 	clipper.Execute( ClipperLib.ClipType.ctIntersection, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero );

	// 	// Convert clipped result to Three.js geometry
	// 	const clippedVertices = [];
	// 	const clippedIndices = [];
	// 	solution.forEach( ( polygon, index ) => {
	// 		const baseIndex = clippedVertices.length / 3;
	// 		polygon.forEach( point => {
	// 			clippedVertices.push( point.X, point.Y, 0 );
	// 		} );
	// 		for ( let i = 1; i < polygon.length - 1; i++ ) {
	// 			clippedIndices.push( baseIndex, baseIndex + i, baseIndex + i + 1 );
	// 		}
	// 	} );

	// 	// Create geometry for clipped polygon
	// 	const clippedGeometry = new BufferGeometry();
	// 	const clippedVerticesArray = new Float32Array( clippedVertices );
	// 	const clippedIndicesArray = new Uint32Array( clippedIndices );
	// 	clippedGeometry.setAttribute( 'position', new BufferAttribute( clippedVerticesArray, 3 ) );
	// 	clippedGeometry.setIndex( new BufferAttribute( clippedIndicesArray, 1 ) );

	// 	// Create mesh for clipped polygon
	// 	const clippedMesh = new Mesh( clippedGeometry, new MeshBasicMaterial( { color: 0x00ff00, side: DoubleSide } ) );

	// 	// Return or add the mesh to the scene
	// 	return clippedMesh;
	// }

	// buildViaDelaunayv3 ( boundary: TvJunctionBoundary ): Mesh {

	// 	let points = this.convertBoundaryToPositions( boundary );

	// 	points = GeometryUtils.sortByAngle( points, null, false );

	// 	// // Ensure points are not collinear
	// 	points = GeometryUtils.ensureNonCollinear( points );

	// 	// DebugDrawService.instance.drawSphere( GeometryUtils.getCentroid( points ), 1.0, COLOR.RED );

	// 	// // Draw the
	// 	// // points.forEach( p => DebugDrawService.instance.drawSphere( p.clone(), 0.1, COLOR.GREEN ) );
	// 	// points.forEach( ( p, index ) => {
	// 	// 	// Draw the point as a green sphere
	// 	// 	DebugDrawService.instance.drawSphere( p.clone(), 0.1, COLOR.GREEN );

	// 	// 	// Draw lines between consecutive points
	// 	// 	const nextIndex = ( index + 1 ) % points.length;
	// 	// 	DebugDrawService.instance.drawLine( [ p.clone(), points[ nextIndex ].clone() ], COLOR.BLUE, 1 );
	// 	// } );

	// 	// Convert points to a flat array for Delaunator
	// 	const vertices = points.reduce( ( acc, point ) => acc.concat( [ point.x, point.y ] ), [] );

	// 	// Perform Delaunay triangulation
	// 	const delaunay = new Delaunator( vertices );
	// 	let triangles: Uint32Array = delaunay.triangles;

	// 	// Prepare data for polygon-clipping
	// 	const subjectPolygon = [];
	// 	for ( let i = 0; i < triangles.length; i += 3 ) {
	// 		subjectPolygon.push( [
	// 			[ vertices[ triangles[ i ] * 2 ], vertices[ triangles[ i ] * 2 + 1 ] ],
	// 			[ vertices[ triangles[ i + 1 ] * 2 ], vertices[ triangles[ i + 1 ] * 2 + 1 ] ],
	// 			[ vertices[ triangles[ i + 2 ] * 2 ], vertices[ triangles[ i + 2 ] * 2 + 1 ] ]
	// 		] );
	// 	}

	// 	// Define the clipping polygon
	// 	const clipPolygon: any = points.map( p => [ p.x, p.y ] );

	// 	// Perform intersection using polygon-clipping to ensure only triangles inside the boundary are used
	// 	const clippedPolygons = [];
	// 	subjectPolygon.forEach( triangle => {
	// 		const intersection = polygonClipping.intersection( [ triangle ], [ clipPolygon ] );
	// 		if ( intersection.length > 0 ) {
	// 			intersection.forEach( poly => clippedPolygons.push( poly[ 0 ] ) );
	// 		}
	// 	} );

	// 	// Convert clipped result to Three.js geometry
	// 	const clippedVertices = [];
	// 	const clippedIndices = [];
	// 	let indexOffset = 0;

	// 	clippedPolygons.forEach( polygon => {
	// 		const baseIndex = clippedVertices.length / 3;
	// 		polygon.forEach( ( point, index ) => {
	// 			clippedVertices.push( point[ 0 ], point[ 1 ], 0 );
	// 			if ( index < polygon.length - 1 ) {
	// 				clippedIndices.push( baseIndex, baseIndex + index, baseIndex + index + 1 );
	// 			}
	// 		} );
	// 		indexOffset += polygon.length;
	// 	} );

	// 	// Create geometry for clipped polygon
	// 	const clippedGeometry = new BufferGeometry();
	// 	const clippedVerticesArray = new Float32Array( clippedVertices );
	// 	const clippedIndicesArray = new Uint32Array( clippedIndices );
	// 	clippedGeometry.setAttribute( 'position', new BufferAttribute( clippedVerticesArray, 3 ) );
	// 	clippedGeometry.setIndex( new BufferAttribute( clippedIndicesArray, 1 ) );

	// 	// Create mesh for clipped polygon
	// 	const clippedMesh = new Mesh( clippedGeometry, new MeshBasicMaterial( { color: 0x00ff00, side: DoubleSide } ) );

	// 	// Return or add the mesh to the scene
	// 	return clippedMesh;
	// }

	buildViaLaneSegments ( boundary: TvJunctionBoundary ): Mesh {

		// Calculate the reference line based on the farthest points
		function calculateReferenceLine ( points: Vector3[] ): Vector3 {
			const [ point1, point2 ] = GeometryUtils.findFarthestPoints( points );
			DebugDrawService.instance.drawLine( [ point1.clone(), point2.clone() ], COLOR.RED );
			return new Vector3().subVectors( point2, point1 ).normalize();
		}

		// Sort points by their projection on a reference line
		function sortPointsByReferenceLine ( points: Vector3[], referenceLine: Vector3 ): Vector3[] {
			return points.sort( ( a, b ) => {
				const projectionA = a.dot( referenceLine );
				const projectionB = b.dot( referenceLine );
				return projectionA - projectionB;
			} );
		}

		// Alternate points from left and right sides along the reference line
		function interleavePoints ( points: Vector3[] ): Vector3[] {
			const centroid = GeometryUtils.getCentroid( points );
			const leftPoints: Vector3[] = [];
			const rightPoints: Vector3[] = [];

			points.forEach( point => {
				if ( point.x < centroid.x ) {
					leftPoints.push( point );
				} else {
					rightPoints.push( point );
				}
			} );

			const interleavedPoints: Vector3[] = [];
			const maxLength = Math.max( leftPoints.length, rightPoints.length );

			for ( let i = 0; i < maxLength; i++ ) {
				if ( i < leftPoints.length ) {
					interleavedPoints.push( leftPoints[ i ] );
				}
				if ( i < rightPoints.length ) {
					interleavedPoints.push( rightPoints[ i ] );
				}
			}

			return interleavedPoints;
		}

		let points: Vector3[] = [];

		boundary.segments.filter( segment => segment.type == TvBoundarySegmentType.LANE ).forEach( segment => {

			this.createBoundaryPositions( segment ).forEach( pos => points.push( pos ) );

		} );

		// Ensure points are not collinear
		points = GeometryUtils.ensureNonCollinear( points );

		points = GeometryUtils.sortByAngle( points, null, false );

		const center = GeometryUtils.getCentroid( points );

		// Draw the
		// points.forEach( p => DebugDrawService.instance.drawSphere( p.clone(), 0.1, COLOR.GREEN ) );
		points.forEach( ( p, index ) => {
			// Draw the point as a green sphere
			DebugDrawService.instance.drawSphere( p.clone(), 0.1, COLOR.GREEN );

			// Draw lines between consecutive points
			const nextIndex = ( index + 1 ) % points.length;
			DebugDrawService.instance.drawLine( [ p.clone(), points[ nextIndex ].clone() ], COLOR.BLUE, 1 );
		} );

		DebugDrawService.instance.drawSphere( center.clone(), 1.0, COLOR.RED );

		// points = sortPointsByReferenceLine( points, referenceLine );

		// Interleave points from left and right
		// points = interleavePoints( points );

		points.forEach( p => DebugDrawService.instance.drawSphere( p.clone(), 0.1, COLOR.GREEN ) );
		points.forEach( ( p, i ) => DebugDrawService.instance.drawText( i.toString(), p.clone().add( new Vector3( 0, 0, 0.2 ) ), 0.25 ) );

		// Convert points to a flat array for Delaunator
		const vertices = points.reduce( ( acc, point ) => acc.concat( [ point.x, point.y ] ), [] );

		// Perform Delaunay triangulation
		const delaunay = new Delaunator( vertices );
		const triangles: Uint32Array = delaunay.triangles;

		// Create geometry
		const geometry = new BufferGeometry();
		const verticesArray = new Float32Array( points.length * 3 );
		for ( let i = 0; i < points.length; i++ ) {
			verticesArray[ i * 3 ] = points[ i ].x;
			verticesArray[ i * 3 + 1 ] = points[ i ].y;
			verticesArray[ i * 3 + 2 ] = 0; // Z-coordinate
		}
		geometry.setAttribute( 'position', new BufferAttribute( verticesArray, 3 ) );
		geometry.setIndex( new BufferAttribute( triangles, 1 ) );

		// Create mesh
		const mesh = new Mesh( geometry, new MeshBasicMaterial( { color: 0x00ff00, side: FrontSide } ) );

		return mesh;
	}

	convertBoundaryToPositions ( boundary: TvJunctionBoundary ): Vector3[] {

		// if ( !junction.boundary ) junction.boundary = this.createJunctionBoundary( junction );

		// junction.boundary.segments.forEach( segment => console.debug( segment.toString() ) );

		const positions: Vector3[] = [];

		boundary.segments.forEach( segment => {

			this.createBoundaryPositions( segment ).forEach( pos => positions.push( pos ) );

		} );

		return GeometryUtils.sortByAngle( positions, null, true );

	}

	private convertBoundaryToPoints ( boundary: TvJunctionBoundary ): AbstractControlPoint[] {

		// if ( !junction.boundary ) junction.boundary = this.createJunctionBoundary( junction );

		// junction.boundary.segments.forEach( segment => console.debug( segment.toString() ) );

		const points: AbstractControlPoint[] = [];

		boundary.segments.forEach( segment => {

			this.createBoundaryPositions( segment ).forEach( position => {

				const point = new SimpleControlPoint( segment, position );

				point.position.copy( position );

				point.userData.segment = segment;

				points.push( point );

			} );

		} );

		return GeometryUtils.sortPointByAngle( points );
	}

	private createBoundaryPositions ( boundary: TvJunctionSegmentBoundary ): Vector3[] {

		if ( boundary.type == TvBoundarySegmentType.JOINT ) {
			return JunctionUtils.convertJointToPositions( boundary as TvJointBoundary );
		}

		if ( boundary.type == TvBoundarySegmentType.LANE ) {
			return JunctionUtils.convertLaneToPositions( boundary as TvLaneBoundary );
		}

		console.error( 'Unknown boundary type', boundary );

		return [];
	}


	convertBoundaryToShapeComplex ( boundary: TvJunctionBoundary ) {

		// NOTE: THIS NOT WORKING PROPERLY

		const shape = new Shape();

		boundary.segments.forEach( ( segment, i ) => {

			const positions = this.createBoundaryPositions( segment );

			if ( i == 0 ) {
				shape.moveTo( positions[ 0 ].x, positions[ 0 ].y );
			}

			// DebugDrawService.instance.drawText( i.toString(), positions[ 0 ].clone().addScalar( 0.5 ) );

			Log.info( 'Segment', i, segment.toString() );

			if ( segment.type == TvBoundarySegmentType.JOINT ) {

				positions.forEach( pos => shape.lineTo( pos.x, pos.y ) );

			} else if ( segment.type == TvBoundarySegmentType.LANE ) {

				shape.splineThru( positions.map( pos => new Vector2( pos.x, pos.y ) ) );

			} else {

				Log.error( 'Unknown segment type', segment?.toString() );
			}

		} );

		return shape;
	}

	convertBoundaryToShapeSimple ( boundary: TvJunctionBoundary ) {

		const positions = this.convertBoundaryToPositions( boundary );

		const centroid = GeometryUtils.getCentroid( positions );

		const points = positions.map( p => new Vector2( p.x, p.y ) );

		const shape = new Shape();

		// Draw the
		shape.moveTo( points[ 0 ].x, points[ 0 ].y );

		points.forEach( p => shape.lineTo( p.x, p.y ) );

		// Close the shape
		shape.lineTo( points[ 0 ].x, points[ 0 ].y );

		return shape;
	}

	private convertBoundaryToShape ( boundary: TvJunctionBoundary ): Shape {
		const shape = new Shape();
		let isFirstPoint = true;

		boundary.segments.forEach( segment => {
			const positions = this.createBoundaryPositions( segment );

			if ( segment.type == TvBoundarySegmentType.JOINT ) {
				// Handle joint boundary as straight lines
				positions.forEach( pos => {
					if ( isFirstPoint ) {
						shape.moveTo( pos.x, pos.y );
						isFirstPoint = false;
					} else {
						shape.lineTo( pos.x, pos.y );
					}
				} );
			} else if ( segment.type == TvBoundarySegmentType.LANE ) {
				// Handle lane boundary as curves
				if ( positions.length >= 3 ) {
					const curvePoints = positions.map( pos => new Vector2( pos.x, pos.y ) );
					shape.splineThru( curvePoints );
				} else {
					// Fallback to lineTo if not enough points for spline
					positions.forEach( pos => {
						if ( isFirstPoint ) {
							shape.moveTo( pos.x, pos.y );
							isFirstPoint = false;
						} else {
							shape.lineTo( pos.x, pos.y );
						}
					} );
				}
			} else {
				Log.error( 'Unknown segment type', segment?.toString() );
			}
		} );

		// Close the shape if it's supposed to be a closed loop
		if ( !isFirstPoint ) {
			shape.lineTo( shape.currentPoint.x, shape.currentPoint.y );
		}

		return shape;
	}

	// private clipping ( triangles: Uint32Array, vertices: Float32Array ) {

	// 	// Define the clipping polygon
	// 	const clippingPolygon = [
	// 		{ X: 0, Y: 0 },
	// 		{ X: 160, Y: 0 },
	// 		{ X: 160, Y: 100 },
	// 		{ X: 0, Y: 100 }
	// 	];

	// 	// Convert Delaunay triangles to jsclipper format
	// 	const subjectPolygon = [];
	// 	for ( let i = 0; i < triangles.length; i += 3 ) {
	// 		subjectPolygon.push( [
	// 			{ X: vertices[ triangles[ i ] * 2 ], Y: vertices[ triangles[ i ] * 2 + 1 ] },
	// 			{ X: vertices[ triangles[ i + 1 ] * 2 ], Y: vertices[ triangles[ i + 1 ] * 2 + 1 ] },
	// 			{ X: vertices[ triangles[ i + 2 ] * 2 ], Y: vertices[ triangles[ i + 2 ] * 2 + 1 ] }
	// 		] );
	// 	}

	// 	// Use jsclipper to clip the polygon
	// 	const clipper = new ClipperLib.Clipper();
	// 	clipper.AddPaths( subjectPolygon, ClipperLib.PolyType.ptSubject, true );
	// 	clipper.AddPath( clippingPolygon, ClipperLib.PolyType.ptClip, true );

	// 	const solution = new ClipperLib.Paths();
	// 	clipper.Execute( ClipperLib.ClipType.ctIntersection, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero );

	// 	// Convert clipped result to Three.js geometry
	// 	const clippedVertices = [];
	// 	const clippedIndices = [];
	// 	solution.forEach( ( polygon, index ) => {
	// 		polygon.forEach( ( point, i ) => {
	// 			clippedVertices.push( point.X, point.Y, 0 );
	// 			if ( i < polygon.length - 1 ) {
	// 				clippedIndices.push( index, index + 1, ( index + 2 ) % polygon.length );
	// 			}
	// 		} );
	// 	} );

	// 	// Create geometry for clipped polygon
	// 	const clippedGeometry = new BufferGeometry();
	// 	const clippedVerticesArray = new Float32Array( clippedVertices );
	// 	const clippedIndicesArray = new Uint32Array( clippedIndices );
	// 	clippedGeometry.setAttribute( 'position', new BufferAttribute( clippedVerticesArray, 3 ) );
	// 	clippedGeometry.setIndex( new BufferAttribute( clippedIndicesArray, 1 ) );

	// 	// Create mesh for clipped polygon
	// 	const clippedMesh = new Mesh( clippedGeometry, new MeshBasicMaterial( { color: 0x00ff00, side: FrontSide } ) );

	// 	// Return or add the mesh to the scene
	// 	return clippedMesh;

	// }
}

