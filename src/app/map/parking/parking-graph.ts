import { Vector3 } from "three";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { ParkingCurve } from "./parking-curve";
import { ParkingEdge } from "./parking-edge";
import { ParkingNode } from "./parking-node";
import { ParkingRegion } from "./parking-region";

export class ParkingGraph {

	private parkingCurves: ParkingCurve[] = [];
	private nodes: ParkingNode[] = [];
	private edges: ParkingEdge[] = [];
	private regions: ParkingRegion[] = [];

	getParkingCurves (): readonly ParkingCurve[] {
		return this.parkingCurves;
	}

	getParkingCurveCount (): number {
		return this.parkingCurves.length;
	}

	addParkingCurve ( parkingCurve: ParkingCurve ): void {
		this.parkingCurves.push( parkingCurve );
	}

	removeParkingCurve ( parkingCurve: ParkingCurve ): void {
		const index = this.parkingCurves.indexOf( parkingCurve );
		if ( index === -1 ) {
			throw new Error( `ParkingCurve with id ${ parkingCurve.id } not found` );
		} else {
			this.parkingCurves.splice( index, 1 );
		}
	}

	getNodes (): ParkingNode[] {
		return this.nodes;
	}

	getNodeCount (): number {
		return this.nodes.length;
	}

	getEdges (): ParkingEdge[] {
		return this.edges;
	}

	getEdgeCount (): number {
		return this.edges.length;
	}

	getRegions (): ParkingRegion[] {
		return this.regions;
	}

	getRegionCount (): number {
		return this.regions.length;
	}

	createParkingCurve ( positions: Vector3[] ): ParkingCurve {

		const curve = new ParkingCurve();

		const points = positions.map( point => new SimpleControlPoint( curve, point ) );

		curve.setControlPoints( points );

		this.parkingCurves.push( curve );

		return curve;

	}

	/**
	 * Bake the given curve into one or more ParkingRegion(s).
	 * This method will:
	 *   1) Generate the polygons (preview) from the curve
	 *   2) Convert those polygons into shared edges/nodes
	 *   3) Create ParkingRegion(s) referencing those edges
	 */
	public bakeCurve ( curve: ParkingCurve ): ParkingRegion[] {
		const newRegions = curve.bake( this );
		// Remove the curve from the unbaked list
		this.parkingCurves = this.parkingCurves.filter( c => c !== curve );
		// Add the newly created regions to the graph
		// this.regions.push( ...newRegions );
		return newRegions;
	}

	/**
	 * Find or create a node at a given (x,y,z).
	 * You can implement tolerance logic if you want to reuse
	 * existing nodes that are "close enough" to reduce duplicates.
	 */
	public getOrCreateNode ( position: Vector3 ): ParkingNode {
		// For simplicity, let's skip tolerance and do exact matches
		const existing = this.nodes.find( node =>
			node.position.equals( position )
		);
		if ( existing ) return existing;

		// Otherwise create a new node
		const newNode = new ParkingNode( position );
		this.nodes.push( newNode );
		return newNode;
	}

	/**
	 * Find or create an edge connecting two nodes.
	 * Could do something similar to avoid duplicates.
	 */
	public getOrCreateEdge ( start: ParkingNode, end: ParkingNode ): ParkingEdge {
		// Ensure consistent ordering if needed
		// Could search for an existing edge with the same node references
		const existing = this.edges.find( e =>
			( e.startNode === start && e.endNode === end ) ||
			( e.startNode === end && e.endNode === start )
		);
		if ( existing ) return existing;

		// Otherwise create new
		const newEdge = new ParkingEdge( start, end );
		this.edges.push( newEdge );
		return newEdge;
	}

	public createRegion ( edgeList: ParkingEdge[] ): ParkingRegion {
		const region = new ParkingRegion();
		region.setEdges( edgeList );
		// Let the region know about the edges
		this.regions.push( region );
		return region;
	}

}
