/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ParkingEdge } from "./parking-edge";
import { MathUtils } from "three/src/math/MathUtils";
import { Vector2, Vector3 } from "three";
import { ParkingNode } from "./parking-node";
import { Box2 } from "app/core/maths";
import { Log } from "app/core/utils/log";

export class ParkingRegion {

	private edges: ParkingEdge[] = [];

	public id: string;

	constructor ( public heading: number ) {
		this.id = MathUtils.generateUUID();
	}

	setHeading ( heading: number ): void {
		this.heading = heading;
	}

	getEdgeCount (): number {
		return this.edges.length;
	}

	getEdges (): ParkingEdge[] {
		return this.edges;
	}

	getNodes (): ParkingNode[] {
		return this.edges.flatMap( edge => [ edge.getStartNode(), edge.getEndNode() ] );
	}

	addEdge ( edge: ParkingEdge ): void {
		this.edges.push( edge );
	}

	removeEdge ( edge: ParkingEdge ): void {
		const index = this.edges.indexOf( edge );

		if ( index !== -1 ) {
			this.edges.splice( index, 1 );
		}
	}

	setEdges ( edges: ParkingEdge[] ): void {
		this.edges = edges;
	}

	getPoints (): Vector3[] {
		// return this.edges.map( edge => [ edge.startNode.position, edge.endNode.position ] );
		return this.edges.flatMap( edge => [ edge.getStartNode().position, edge.getEndNode().position ] );
	}

	getUniquePoints (): Vector3[] {
		const uniquePoints = new Map<string, Vector3>();

		this.edges.forEach( edge => {
			uniquePoints.set( edge.getStartNode().id, edge.getStartNode().position );
			uniquePoints.set( edge.getEndNode().id, edge.getEndNode().position );
		} );

		return Array.from( uniquePoints.values() );
	}

	getCenterPosition (): Vector3 {
		if ( this.edges.length === 0 ) return new Vector3();
		const sum = this.edges.reduce( ( acc, edge ) => acc.add( edge.getStartNode().position ), new Vector3() );
		return sum.divideScalar( this.edges.length );
	}

	getBoundingBox (): Box2 {
		return createParkingRegionBoundingBox( this );
	}

	/**
	 * If you want the region's nodes in order,
	 * you can derive them from edges. For a simple polygon,
	 * each edge's end node matches the next edge's start node.
	 */
	public getNodesInOrder (): ParkingNode[] {

		if ( this.edges.length === 0 ) return [];

		const orderedNodes: ParkingNode[] = [];

		// naive approach: start with the first edge's start node
		let currentEdge = this.edges[ 0 ];

		orderedNodes.push( currentEdge.getStartNode() );

		// Then proceed, matching end node to the next edge's start node
		for ( let i = 0; i < this.edges.length; i++ ) {

			orderedNodes.push( currentEdge.getEndNode() );

			// find the next edge whose startNode is the last endNode
			const nextEdge = this.edges.find( e => e.getStartNode().matches( currentEdge.getEndNode() ) );

			if ( !nextEdge ) break; // or handle if region is closed

			currentEdge = nextEdge;

		}

		return orderedNodes;
	}

	toSceneJSON (): any {
		return {
			attr_id: this.id,
			attr_heading: this.heading,
			edge: this.edges.map( edge => {
				return {
					attr_id: edge.id
				};
			} )
		};
	}

}


/**
 * Creates a 2D bounding box for a ParkingRegion
 * @param {ParkingRegion} region - The parking region to create a bounding box for
 * @param {number} yOffset - Optional Y offset for the bounding box (default: 0)
 * @returns {Object} - An object containing the Box3 and optional BoxHelper
 */
function createParkingRegionBoundingBox ( region: ParkingRegion ): Box2 {

	// Get all points from the region
	const points = region.getUniquePoints();

	if ( points.length === 0 ) {
		Log.warn( 'No points found in region:', region.id );
		return new Box2();
	}

	// Create a bounding box
	const boundingBox = new Box2();

	// Compute the bounding box from points
	points.forEach( point => {
		boundingBox.expandByPoint( new Vector2( point.x, point.y ) );
	} );

	// For 2D bounding box, we can set a fixed height
	// Get min and max
	const min = boundingBox.min;
	const max = boundingBox.max;

	// For a 2D bounding box, flatten the Y dimension
	// You can adjust this based on your coordinate system
	const flattenedMin = new Vector2( min.x, min.y );
	const flattenedMax = new Vector2( max.x, max.y );

	// Create a new box with the flattened coordinates
	return new Box2( flattenedMin, flattenedMax );

}

// Another version of the bounding box creation that considers the region's orientation
function createBoundingBox ( region: ParkingRegion ): Box2 {

	const points = region.getUniquePoints(); // Use unique points

	if ( points.length < 2 ) return new Box2();

	// For a rectangular parking space, calculate dimensions along its actual orientation
	const center = region.getCenterPosition();

	// Transform points to local coordinate system based on heading
	const cos = Math.cos( -region.heading );
	const sin = Math.sin( -region.heading );

	let minX = Infinity, maxX = -Infinity;
	let minY = Infinity, maxY = -Infinity;

	points.forEach( point => {
		// Translate to origin
		const dx = point.x - center.x;
		const dy = point.y - center.y;

		// Rotate to align with parking space orientation
		const localX = dx * cos - dy * sin;
		const localY = dx * sin + dy * cos;

		minX = Math.min( minX, localX );
		maxX = Math.max( maxX, localX );
		minY = Math.min( minY, localY );
		maxY = Math.max( maxY, localY );
	} );

	const width = maxX - minX;
	const length = maxY - minY;

	// Return a box with correct dimensions
	return new Box2(
		new Vector2( -width / 2, -length / 2 ),
		new Vector2( width / 2, length / 2 )
	);
}
