import { ParkingEdge } from "./parking-edge";
import { MathUtils } from "three/src/math/MathUtils";
import { Vector2, Vector3 } from "three";
import { ParkingNode } from "./parking-node";
import { Box2 } from "app/core/maths";
import { Log } from "app/core/utils/log";

export class ParkingRegion {

	private edges: ParkingEdge[] = [];

	public readonly id: string;

	constructor ( public readonly heading: number ) {
		this.id = MathUtils.generateUUID();
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
		this.edges.splice( this.edges.indexOf( edge ), 1 );
	}

	setEdges ( edges: ParkingEdge[] ): void {
		this.edges = edges;
	}

	getPoints (): Vector3[] {
		// return this.edges.map( edge => [ edge.startNode.position, edge.endNode.position ] );
		return this.edges.flatMap( edge => [ edge.getStartNode().position, edge.getEndNode().position ] );
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
			id: this.id,
			heading: this.heading,
			edges: this.edges.map( edge => edge.toSceneJSON() )
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
	const points = region.getPoints();

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
